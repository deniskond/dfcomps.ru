import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DeepPartial, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { LeaderTableInterface, Physics, RatingTablesModes, Rewards, SeasonNumberInterface } from '@dfcomps/contracts';
import { User } from '../../../shared/entities/user.entity';
import { Season } from '../../../shared/entities/season.entity';
import { OldRating } from '../../../shared/entities/old-rating.entity';
import { UserAccessInterface } from 'apps/backend/src/shared/interfaces/user-access.interface';
import { AuthService } from '../../auth/auth.service';
import { UserRoles, checkUserRoles } from '@dfcomps/auth';
import { RatingChange } from 'apps/backend/src/shared/entities/rating-change.entity';
import { Reward } from 'apps/backend/src/shared/entities/reward.entity';
import { TablesService } from '../../tables/tables.service';

@Injectable()
export class AdminSeasonService {
  constructor(
    @InjectRepository(Season) private readonly seasonRepository: Repository<Season>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(OldRating) private readonly oldRatingRepository: Repository<OldRating>,
    @InjectRepository(RatingChange) private readonly ratingChangeRepository: Repository<RatingChange>,
    @InjectRepository(Reward) private readonly rewardRepository: Repository<Reward>,
    private readonly authService: AuthService,
    private readonly tablesService: TablesService,
  ) {}

  public async getSeason(): Promise<SeasonNumberInterface> {
    const { season }: Season = (await this.seasonRepository.createQueryBuilder('season').getOne())!;

    return {
      season,
    };
  }

  public async saveSeasonRatings(accessToken: string | undefined): Promise<void> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!checkUserRoles(userAccess.roles, [UserRoles.ADMIN])) {
      throw new UnauthorizedException('Unauthorized to save season ratings without ADMIN role');
    }

    const { season }: Season = (await this.seasonRepository.createQueryBuilder('season').getOne())!;
    const players: User[] = await this.userRepository.createQueryBuilder('users').getMany();
    const oldRatings: DeepPartial<OldRating>[] = players
      .filter((user: User) => user.cpm_rating > 1500 || user.vq3_rating > 1500)
      .map((user: User) => ({
        user: {
          id: user.id,
        },
        season,
        cpm_rating: user.cpm_rating === 1500 ? 0 : user.cpm_rating,
        vq3_rating: user.vq3_rating === 1500 ? 0 : user.vq3_rating,
      }));

    await this.oldRatingRepository
      .createQueryBuilder('old_ratings')
      .insert()
      .into(OldRating)
      .values(oldRatings)
      .execute();
  }

  public async setSeasonRewards(accessToken: string | undefined): Promise<void> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!checkUserRoles(userAccess.roles, [UserRoles.ADMIN])) {
      throw new UnauthorizedException('Unauthorized to save season ratings without ADMIN role');
    }

    const { season }: Season = (await this.seasonRepository.createQueryBuilder('season').getOne())!;

    const ratingChanges: RatingChange[] = await this.ratingChangeRepository
      .createQueryBuilder('rating_changes')
      .leftJoinAndSelect('rating_changes.user', 'users')
      .distinctOn(['rating_changes.userId'])
      .where({ season })
      .getMany();

    const rewards: DeepPartial<Reward>[] = [];

    const cpmTop10: LeaderTableInterface[] = await this.tablesService.getTop10(Physics.CPM, RatingTablesModes.CLASSIC);
    const vq3Top10: LeaderTableInterface[] = await this.tablesService.getTop10(Physics.VQ3, RatingTablesModes.CLASSIC);

    cpmTop10.forEach((top10Entry: LeaderTableInterface, index: number) => {
      const rewardName = `Top ${index < 3 ? index + 1 : 10} CPM (season ${season})`;

      rewards.push({
        user: {
          id: top10Entry.playerId,
        },
        name_en: rewardName as Rewards,
      });
    });

    vq3Top10.forEach((top10Entry: LeaderTableInterface, index: number) => {
      const rewardName = `Top ${index < 3 ? index + 1 : 10} VQ3 (season ${season})`;

      rewards.push({
        user: {
          id: top10Entry.playerId,
        },
        name_en: rewardName as Rewards,
      });
    });

    ratingChanges.forEach((ratingChange: RatingChange) => {
      rewards.push({
        user: {
          id: ratingChange.user.id,
        },
        name_en: `Season ${season} participant` as Rewards,
      });
    });

    await this.rewardRepository.createQueryBuilder('rewards').insert().into(Reward).values(rewards).execute();
  }

  public async resetRatings(accessToken: string | undefined): Promise<void> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!checkUserRoles(userAccess.roles, [UserRoles.ADMIN])) {
      throw new UnauthorizedException('Unauthorized to save season ratings without ADMIN role');
    }

    const cpmPlayers: User[] = (
      await this.userRepository.createQueryBuilder('users').where('cpm_rating != 0 AND cpm_rating != 1500').getMany()
    ).sort((user1: User, user2: User) => user1.cpm_rating - user2.cpm_rating);

    let cpmPlayersUpdate: DeepPartial<User>[] = [];
    let currentCpmAddition = 1;

    cpmPlayers.forEach((user: User, index: number) => {
      if (index !== 0 && user.cpm_rating !== cpmPlayers[index - 1].cpm_rating) {
        currentCpmAddition++;
      }

      cpmPlayersUpdate.push({
        id: user.id,
        cpm_rating: 1500 + currentCpmAddition,
        initial_cpm_rating: 1500 + currentCpmAddition,
      });
    });

    await this.userRepository.save(cpmPlayersUpdate);

    const vq3Players: User[] = (
      await this.userRepository.createQueryBuilder('users').where('vq3_rating != 0 AND vq3_rating != 1500').getMany()
    ).sort((user1: User, user2: User) => user1.vq3_rating - user2.vq3_rating);

    let vq3PlayersUpdate: DeepPartial<User>[] = [];
    let currentVq3Addition = 1;

    vq3Players.forEach((user: User, index: number) => {
      if (index !== 0 && user.vq3_rating !== vq3Players[index - 1].vq3_rating) {
        currentVq3Addition++;
      }

      vq3PlayersUpdate.push({
        id: user.id,
        vq3_rating: 1500 + currentVq3Addition,
        initial_vq3_rating: 1500 + currentVq3Addition,
      });
    });

    await this.userRepository.save(vq3PlayersUpdate);
  }

  public async incrementSeason(accessToken: string | undefined): Promise<void> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!checkUserRoles(userAccess.roles, [UserRoles.ADMIN])) {
      throw new UnauthorizedException('Unauthorized to save season ratings without ADMIN role');
    }

    const { season }: Season = (await this.seasonRepository.createQueryBuilder('season').getOne())!;

    await this.seasonRepository
      .createQueryBuilder('season')
      .update(Season)
      .set({ season: season + 1 })
      .execute();
  }
}
