import { NickChangeResponseInterface, Physics, ProfileDemosInterface, ProfileInterface } from '@dfcomps/contracts';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../shared/entities/user.entity';
import { Season } from '../../shared/entities/season.entity';
import { RatingChange } from '../../shared/entities/rating-change.entity';
import { CupDemo } from '../../shared/entities/cup-demo.entity';
import { Reward } from '../../shared/entities/reward.entity';
import { UserAccessInterface } from '../../shared/interfaces/user-access.interface';
import { AuthService } from '../auth/auth.service';
import * as moment from 'moment';
import * as fs from 'fs';
import * as sharp from 'sharp';

@Injectable()
export class ProfileService {
  private readonly MAX_RATING_RECORDS = 8;

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Season) private readonly seasonRepository: Repository<Season>,
    @InjectRepository(RatingChange) private readonly ratingChangeRepository: Repository<RatingChange>,
    @InjectRepository(CupDemo) private readonly cupsDemosRepository: Repository<CupDemo>,
    @InjectRepository(Reward) private readonly rewardRepository: Repository<Reward>,
    private readonly authService: AuthService,
  ) {}

  public async getPlayerProfile(userId: number): Promise<ProfileInterface> {
    const player: User | null = await this.userRepository.createQueryBuilder('users').where({ id: userId }).getOne();

    if (!player) {
      throw new NotFoundException(`Player with id ${userId} not found`);
    }

    const cups: RatingChange[] = await this.ratingChangeRepository
      .createQueryBuilder('rating_changes')
      .leftJoinAndSelect('rating_changes.cup', 'cups')
      .leftJoinAndSelect('cups.news', 'news', 'news.newsTypeId = 5 OR news.newsTypeId = 1')
      .where('rating_changes.userId = :userId', { userId })
      .andWhere('cups.rating_calculated = true')
      .orderBy('cups.id', 'DESC')
      .limit(10)
      .getMany();

    const demos: CupDemo[] = await this.cupsDemosRepository
      .createQueryBuilder('cups_demos')
      .leftJoinAndSelect('cups_demos.cup', 'cups')
      .where('cups_demos.userId = :userId', { userId })
      .andWhere('cups.rating_calculated = true')
      .orderBy('cups.id', 'DESC')
      .addOrderBy('cups_demos.physics', 'ASC')
      .addOrderBy('cups_demos.time', 'ASC')
      .limit(10)
      .getMany();

    const filteredDemos: ProfileDemosInterface[] = demos.reduce(
      (filteredDemos: ProfileDemosInterface[], demo: CupDemo, index: number) => {
        // Leaving only the best times; taking advantage of the fact that demos are already ordered by cups and times
        if (index > 0 && demo.physics === demos[index - 1].physics && demo.cup.id === demos[index - 1].cup.id) {
          return filteredDemos;
        }

        return [
          ...filteredDemos,
          {
            demopath: demo.demopath,
            archive: demo.cup.archive_link,
          },
        ];
      },
      [],
    );

    const { season }: Season = (await this.seasonRepository.createQueryBuilder('season').getOne())!;
    const ratingChanges: RatingChange[] = await this.ratingChangeRepository
      .createQueryBuilder('rating_changes')
      .where('rating_changes.userId = :userId', { userId })
      .andWhere('rating_changes.season = :season', { season })
      .orderBy('rating_changes.cupId', 'ASC')
      .getMany();

    const vq3RatingChanges: number[] = this.getPhysicsRatingChanges(Physics.VQ3, ratingChanges, player);
    const cpmRatingChanges: number[] = this.getPhysicsRatingChanges(Physics.CPM, ratingChanges, player);

    const rewards: Reward[] = await this.rewardRepository
      .createQueryBuilder('rewards')
      .where('rewards.userId = :userId', { userId })
      .getMany();

    return {
      player: {
        avatar: player.avatar,
        nick: player.displayed_nick,
        vq3Rating: player.vq3_rating,
        cpmRating: player.cpm_rating,
        country: player.country,
      },
      rating: {
        cpm: cpmRatingChanges,
        vq3: vq3RatingChanges,
      },
      demos: filteredDemos,
      cups: cups.map((ratingChange: RatingChange) => ({
        full_name: ratingChange.cup.full_name,
        short_name: ratingChange.cup.short_name,
        news_id: ratingChange.cup.news[0]?.id || null,
        cpm_place: ratingChange.cpm_place,
        vq3_place: ratingChange.vq3_place,
        cpm_change: ratingChange.cpm_change,
        vq3_change: ratingChange.vq3_change,
      })),
      rewards: rewards.map((reward: Reward) => ({
        name: reward.name_en,
      })),
    };
  }

  public async checkLastNickChangeTime(accessToken: string): Promise<NickChangeResponseInterface> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);
    const user: User | null = await this.userRepository
      .createQueryBuilder('users')
      .where({ id: userAccess.userId })
      .getOne();

    if (!user) {
      throw new UnauthorizedException("Can't check unauthorized user");
    }

    const isChangeAllowed: boolean = user.last_nick_change_time
      ? moment().isAfter(moment(user.last_nick_change_time).add(1, 'month'))
      : true;

    return {
      change_allowed: isChangeAllowed,
    };
  }

  public async updateProfileInfo(accessToken: string, nick: string, country: string | undefined): Promise<void> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!userAccess.userId) {
      throw new UnauthorizedException("Can't update profile while unauthorized");
    }

    const user: User = (await this.userRepository
      .createQueryBuilder('users')
      .where({ id: userAccess.userId })
      .getOne())!;

    let newUserName: string = user.displayed_nick;
    let lastNickChangeTime: string | null = user.last_nick_change_time;

    if (user.displayed_nick !== nick) {
      if (user.last_nick_change_time && moment().isBefore(moment(user.last_nick_change_time).add(1, 'month'))) {
        throw new BadRequestException('Too soon to change nickname');
      }

      newUserName = nick;
      lastNickChangeTime = moment().format();
    }

    await this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({
        displayed_nick: newUserName,
        country,
        last_nick_change_time: lastNickChangeTime,
      })
      .where({ id: user.id })
      .execute();
  }

  public async updateProfileAvatar(accessToken: string, avatar: Express.Multer.File): Promise<void> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!userAccess.userId) {
      throw new UnauthorizedException("Can't update profile while unauthorized");
    }

    const user: User = (await this.userRepository
      .createQueryBuilder('users')
      .where({ id: userAccess.userId })
      .getOne())!;

    const previousAvatar = user.avatar;
    const newAvatarFileName = `${user.id}_${moment().format('x')}`;

    if (fs.existsSync(process.env.DFCOMPS_FILE_UPLOAD_PATH + `\\images\\avatars\\${previousAvatar}.jpg`)) {
      fs.rmSync(process.env.DFCOMPS_FILE_UPLOAD_PATH + `\\images\\avatars\\${previousAvatar}.jpg`);
    }

    const resizedImage: Buffer = await sharp(avatar.buffer)
      .resize(150, 150)
      .jpeg()
      .toBuffer()
      .catch(() => {
        throw new InternalServerErrorException('Failed to resize image');
      });

    fs.writeFileSync(
      process.env.DFCOMPS_FILE_UPLOAD_PATH + '\\images\\avatars\\' + newAvatarFileName + '.jpg',
      resizedImage,
    );

    await this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({
        avatar: newAvatarFileName,
      })
      .where({ id: user.id })
      .execute();
  }

  private getPhysicsRatingChanges(physics: Physics, ratingChanges: RatingChange[], player: User): number[] {
    let physicsRatingChanges: number[] = ratingChanges
      .filter((ratingChange: RatingChange) => ratingChange[`${physics}_change`] != 0)
      .slice(-this.MAX_RATING_RECORDS)
      .map((ratingChange: RatingChange) => ratingChange[`${physics}_change`]!);

    for (let index = physicsRatingChanges.length - 1; index >= 0; index--) {
      if (index === physicsRatingChanges.length - 1) {
        physicsRatingChanges[index] = player[`${physics}_rating`] - physicsRatingChanges[index];
      } else {
        physicsRatingChanges[index] = physicsRatingChanges[index + 1] - physicsRatingChanges[index];
      }
    }

    if (physicsRatingChanges.length < this.MAX_RATING_RECORDS) {
      physicsRatingChanges = [player[`initial_${physics}_rating`], ...physicsRatingChanges];
    }

    return physicsRatingChanges;
  }
}
