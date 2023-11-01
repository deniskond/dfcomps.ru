import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from '../../shared/entities/match.entity';
import {
  DFCOMPS_BOT_ID,
  DuelPlayerInfoInterface,
  DuelPlayersInfoResponseInterface,
  EligiblePlayersInterface,
  Physics,
  UpdateBotTimeDto,
} from '@dfcomps/contracts';
import { AuthService } from '../auth/auth.service';
import { UserAccessInterface } from '../../shared/interfaces/user-access.interface';
import { User } from '../../shared/entities/user.entity';
import { RatingChange } from '../../shared/entities/rating-change.entity';
import * as moment from 'moment';
import { OneVOneRating } from '../../shared/entities/1v1-rating.entity';
import { FinishMatchInterface } from './finish-match.interface';

@Injectable()
export class MatchService {
  constructor(
    @InjectRepository(Match) private readonly matchesRepository: Repository<Match>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(RatingChange) private readonly ratingChangesRepository: Repository<RatingChange>,
    @InjectRepository(OneVOneRating) private readonly oneVOneRatingsRepository: Repository<OneVOneRating>,
    private readonly authService: AuthService,
  ) {}

  public async getMatchInfo(accessToken: string): Promise<DuelPlayersInfoResponseInterface> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!userAccess.userId) {
      throw new UnauthorizedException("Can't get match info as unauthorized user");
    }

    const user: User = (await this.userRepository
      .createQueryBuilder('users')
      .where({ id: userAccess.userId })
      .getOne())!;

    const match: Match | null = await this.matchesRepository
      .createQueryBuilder('matches')
      .where({ first_player_id: userAccess.userId })
      .orWhere({ second_player_id: userAccess.userId })
      .orderBy('id', 'DESC')
      .limit(1)
      .getOne();

    if (!match) {
      throw new NotFoundException('No active match found');
    }

    const dfcompsBotInfo: DuelPlayerInfoInterface = {
      nick: 'dfcomps bot',
      country: null,
      rating: match.physics === Physics.CPM ? user.cpm_rating : user.vq3_rating,
    };

    let firstPlayerInfo: DuelPlayerInfoInterface;
    let secondPlayerInfo: DuelPlayerInfoInterface;
    let firstPlayerRatingChange: number | null = null;
    let secondPlayerRatingChange: number | null = null;

    if (match.first_player_id !== -1) {
      const firstPlayer: User = (await this.userRepository
        .createQueryBuilder('users')
        .leftJoinAndSelect('users.oneVOneRating', '1v1_rating')
        .where('users.id = :firstPlayerId', { firstPlayerId: match.first_player_id })
        .getOne())!;

      firstPlayerInfo = {
        nick: firstPlayer.displayed_nick,
        country: firstPlayer.country,
        rating:
          match.physics === Physics.CPM
            ? firstPlayer.oneVOneRating?.cpm || 1500
            : firstPlayer.oneVOneRating?.vq3 || 1500,
      };
    } else {
      firstPlayerInfo = { ...dfcompsBotInfo };
      firstPlayerRatingChange = 0;
    }

    if (match.second_player_id !== -1) {
      const secondPlayer: User = (await this.userRepository
        .createQueryBuilder('users')
        .leftJoinAndSelect('users.oneVOneRating', '1v1_rating')
        .where('users.id = :firstPlayerId', { firstPlayerId: match.first_player_id })
        .getOne())!;

      secondPlayerInfo = {
        nick: secondPlayer.displayed_nick,
        country: secondPlayer.country,
        rating:
          match.physics === Physics.CPM
            ? secondPlayer.oneVOneRating?.cpm || 1500
            : secondPlayer.oneVOneRating?.vq3 || 1500,
      };
    } else {
      secondPlayerInfo = { ...dfcompsBotInfo };
      secondPlayerRatingChange = 0;
    }

    const matchInfo: DuelPlayersInfoResponseInterface = {
      matchId: match.id,
      firstPlayerId: match.first_player_id,
      secondPlayerId: match.second_player_id,
      firstPlayerTime: match.first_player_time,
      firstPlayerDemo: match.first_player_demo,
      secondPlayerTime: match.second_player_time,
      secondPlayerDemo: match.second_player_demo,
      startDatetime: match.start_datetime,
      isFinished: match.is_finished,
      physics: match.physics,
      map: match.map,
      firstPlayerInfo,
      secondPlayerInfo,
      firstPlayerRatingChange: firstPlayerRatingChange === null ? match.first_player_rating_change : 0,
      secondPlayerRatingChange: secondPlayerRatingChange === null ? match.second_player_rating_change : 0,
      securityCode: match.security_code,
    };

    if (match.is_finished) {
      return matchInfo;
    }

    if (userAccess.userId === match.first_player_id) {
      match.second_player_time = null;
      match.second_player_demo = null;
    }

    if (userAccess.userId === match.second_player_id) {
      match.first_player_time = null;
      match.first_player_demo = null;
    }

    return matchInfo;
  }

  public async getEligiblePlayers(): Promise<EligiblePlayersInterface> {
    const players: { userId: number }[] = await this.ratingChangesRepository
      .createQueryBuilder('rating_changes')
      .select('rating_changes.userId')
      .groupBy('rating_changes.userId')
      .having('COUNT(rating_changes.userId) > 2')
      .getRawMany();

    return { players: players.map(({ userId }) => userId) };
  }

  public async startMatch(
    secretKey: string | undefined,
    firstPlayerId: number,
    secondPlayerId: number,
    physics: Physics,
  ): Promise<void> {
    if (secretKey !== process.env.DUELS_SERVER_PRIVATE_KEY) {
      throw new UnauthorizedException("Secret key doesn't match");
    }

    await this.matchesRepository
      .createQueryBuilder()
      .insert()
      .into(Match)
      .values([
        {
          first_player_id: firstPlayerId,
          second_player_id: secondPlayerId,
          physics,
          start_datetime: moment().format(),
          is_finished: false,
          security_code: Math.floor(Math.random() * (99999 - 10000) + 10000).toString(),
        },
      ])
      .execute();
  }

  public async updateMatchInfo(
    secretKey: string | undefined,
    firstPlayerId: number,
    secondPlayerId: number,
    map: string,
  ): Promise<void> {
    if (secretKey !== process.env.DUELS_SERVER_PRIVATE_KEY) {
      throw new UnauthorizedException("Secret key doesn't match");
    }

    await this.matchesRepository
      .createQueryBuilder()
      .update(Match)
      .set({
        map,
      })
      .where({ first_player_id: firstPlayerId })
      .andWhere({ second_player_id: secondPlayerId })
      .andWhere({ is_finished: false })
      .execute();
  }

  public async updateBotTime(
    secretKey: string | undefined,
    { firstPlayerId, secondPlayerId, physics, wr }: UpdateBotTimeDto,
  ): Promise<void> {
    if (secretKey !== process.env.DUELS_SERVER_PRIVATE_KEY) {
      throw new UnauthorizedException("Secret key doesn't match");
    }

    const humanPlayerId: number = firstPlayerId === DFCOMPS_BOT_ID ? secondPlayerId : firstPlayerId;
    const humanRatingEntry: OneVOneRating | null = await this.oneVOneRatingsRepository
      .createQueryBuilder('1v1_rating')
      .where('1v1_rating.userId = :userId', { userId: humanPlayerId })
      .getOne();

    if (!humanRatingEntry) {
      throw new BadRequestException(`Player with id = ${humanPlayerId} was not found in 1v1 rating`);
    }

    const humanRating: number = humanRatingEntry[physics];
    let botTime: number;

    if (humanRating > 2000) {
      botTime = wr;
    } else if (humanRating < 1200) {
      botTime = wr * 2;
    } else {
      botTime = wr * (1 + (2000 - humanRating) / 800);
    }

    const roundedBotTime = Math.floor(botTime);
    const millis = (botTime - roundedBotTime) * 1000;
    const actualMillis = Math.floor(millis / 8) * 8;

    botTime = roundedBotTime + actualMillis / 1000;

    await this.matchesRepository
      .createQueryBuilder('matches')
      .update(Match)
      .set({
        first_player_time: firstPlayerId === DFCOMPS_BOT_ID ? botTime : null,
        second_player_time: secondPlayerId === DFCOMPS_BOT_ID ? botTime : null,
      })
      .where({ first_player_id: firstPlayerId })
      .andWhere({ second_player_id: secondPlayerId })
      .andWhere({ is_finished: false })
      .execute();
  }

  public async finishMatch(
    secretKey: string | undefined,
    firstPlayerId: number,
    secondPlayerId: number,
  ): Promise<void> {
    if (secretKey !== process.env.DUELS_SERVER_PRIVATE_KEY) {
      throw new UnauthorizedException("Secret key doesn't match");
    }

    const match: FinishMatchInterface | undefined = await this.matchesRepository
      .createQueryBuilder('matches')
      .leftJoinAndSelect('1v1_rating', 'first_rating_table', 'first_rating_table.userId = matches.first_player_id')
      .leftJoinAndSelect('1v1_rating', 'second_rating_table', 'second_rating_table.userId = matches.second_player_id')
      .where({ first_player_id: firstPlayerId })
      .andWhere({ second_player_id: secondPlayerId })
      .andWhere({ is_finished: false })
      .getRawOne();

    if (!match) {
      throw new BadRequestException(`No active match for players ${firstPlayerId} and ${secondPlayerId} found`);
    }

    const matchFirstPlayerTime: number = match.matches_first_player_time || Infinity;
    const matchSecondPlayerTime: number = match.matches_second_player_time || Infinity;
    let firstPlayerResult = matchFirstPlayerTime > matchSecondPlayerTime ? 0 : 1;

    if (matchFirstPlayerTime === matchSecondPlayerTime) {
      firstPlayerResult = 0.5;
    }

    let firstPlayerRating =
      match.matches_physics === Physics.CPM ? match.first_rating_table_cpm : match.first_rating_table_vq3;
    let secondPlayerRating =
      match.matches_physics === Physics.CPM ? match.second_rating_table_cpm : match.second_rating_table_vq3;

    firstPlayerRating = firstPlayerRating || 1500;
    secondPlayerRating = secondPlayerRating || 1500;

    if (match.matches_first_player_id === DFCOMPS_BOT_ID) {
      firstPlayerRating = secondPlayerRating;
    }

    if (match.matches_second_player_id === DFCOMPS_BOT_ID) {
      secondPlayerRating = firstPlayerRating;
    }

    const firstPlayerRatingChange = this.countEloChange(firstPlayerRating, secondPlayerRating, firstPlayerResult);
    const secondPlayerRatingChange = this.countEloChange(secondPlayerRating, firstPlayerRating, 1 - firstPlayerResult);

    if (match.matches_physics === Physics.CPM) {
      if (firstPlayerId !== DFCOMPS_BOT_ID) {
        if (match.first_rating_table_cpm) {
          await this.oneVOneRatingsRepository
            .createQueryBuilder()
            .update(OneVOneRating)
            .set({
              cpm: firstPlayerRating + firstPlayerRatingChange,
            })
            .where({ user: { id: firstPlayerId } })
            .execute();
        } else {
          await this.oneVOneRatingsRepository
            .createQueryBuilder()
            .insert()
            .into(OneVOneRating)
            .values([
              {
                user: { id: firstPlayerId },
                vq3: 1500,
                cpm: firstPlayerRating + firstPlayerRatingChange,
              },
            ])
            .execute();
        }
      }

      if (secondPlayerId !== DFCOMPS_BOT_ID) {
        if (match.second_rating_table_cpm) {
          await this.oneVOneRatingsRepository
            .createQueryBuilder()
            .update(OneVOneRating)
            .set({
              cpm: secondPlayerRating + secondPlayerRatingChange,
            })
            .where({ user: { id: secondPlayerId } })
            .execute();
        } else {
          await this.oneVOneRatingsRepository
            .createQueryBuilder()
            .insert()
            .into(OneVOneRating)
            .values([
              {
                user: { id: secondPlayerId },
                vq3: 1500,
                cpm: secondPlayerRating + secondPlayerRatingChange,
              },
            ])
            .execute();
        }
      }
    }

    if (match.matches_physics === Physics.VQ3) {
      if (firstPlayerId !== DFCOMPS_BOT_ID) {
        if (match.first_rating_table_vq3) {
          await this.oneVOneRatingsRepository
            .createQueryBuilder()
            .update(OneVOneRating)
            .set({
              vq3: firstPlayerRating + firstPlayerRatingChange,
            })
            .where({ user: { id: firstPlayerId } })
            .execute();
        } else {
          await this.oneVOneRatingsRepository
            .createQueryBuilder()
            .insert()
            .into(OneVOneRating)
            .values([
              {
                user: { id: firstPlayerId },
                cpm: 1500,
                vq3: firstPlayerRating + firstPlayerRatingChange,
              },
            ])
            .execute();
        }
      }

      if (secondPlayerId !== DFCOMPS_BOT_ID) {
        if (match.second_rating_table_vq3) {
          await this.oneVOneRatingsRepository
            .createQueryBuilder()
            .update(OneVOneRating)
            .set({
              vq3: secondPlayerRating + secondPlayerRatingChange,
            })
            .where({ user: { id: secondPlayerId } })
            .execute();
        } else {
          await this.oneVOneRatingsRepository
            .createQueryBuilder()
            .insert()
            .into(OneVOneRating)
            .values([
              {
                user: { id: secondPlayerId },
                cpm: 1500,
                vq3: secondPlayerRating + secondPlayerRatingChange,
              },
            ])
            .execute();
        }
      }
    }

    await this.matchesRepository
      .createQueryBuilder()
      .update(Match)
      .set({
        is_finished: true,
        first_player_rating_change: firstPlayerRatingChange,
        second_player_rating_change: secondPlayerRatingChange,
      })
      .where({ first_player_id: firstPlayerId })
      .andWhere({ second_player_id: secondPlayerId })
      .andWhere({ is_finished: false })
      .execute();
  }

  private countEloChange(firstPlayerRating: number, secondPlayerRating: number, result: number): number {
    const expectedResult = 1 / (1 + Math.pow(10, (secondPlayerRating - firstPlayerRating) / 400));

    return Math.round(20 * (result - expectedResult));
  }
}
