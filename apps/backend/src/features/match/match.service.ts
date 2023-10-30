import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from '../../shared/entities/match.entity';
import { DuelPlayerInfoInterface, DuelPlayersInfoResponseInterface, Physics } from '@dfcomps/contracts';
import { AuthService } from '../auth/auth.service';
import { UserAccessInterface } from '../../shared/interfaces/user-access.interface';
import { User } from '../../shared/entities/user.entity';
import { RatingChange } from '../../shared/entities/rating-change.entity';
import * as moment from 'moment';

@Injectable()
export class MatchService {
  constructor(
    @InjectRepository(Match) private readonly matchesRepository: Repository<Match>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(RatingChange) private readonly ratingChangesRepository: Repository<RatingChange>,
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
        .leftJoinAndSelect('1v1_rating.user', 'users')
        .where('users.id = :firstPlayerId', { firstPlayerId: match.first_player_id })
        .getOne())!;

      firstPlayerInfo = {
        nick: firstPlayer.displayed_nick,
        country: firstPlayer.country,
        rating: match.physics === Physics.CPM ? firstPlayer.cpm_rating : firstPlayer.vq3_rating,
      };
    } else {
      firstPlayerInfo = { ...dfcompsBotInfo };
      firstPlayerRatingChange = 0;
    }

    if (match.second_player_id !== -1) {
      const secondPlayer: User = (await this.userRepository
        .createQueryBuilder('users')
        .leftJoinAndSelect('1v1_rating.user', 'users')
        .where('users.id = :firstPlayerId', { firstPlayerId: match.first_player_id })
        .getOne())!;

      secondPlayerInfo = {
        nick: secondPlayer.displayed_nick,
        country: secondPlayer.country,
        rating: match.physics === Physics.CPM ? secondPlayer.cpm_rating : secondPlayer.vq3_rating,
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

  public async getEligiblePlayers(): Promise<number[]> {
    const players: { userId: number }[] = await this.ratingChangesRepository
      .createQueryBuilder('rating_changes')
      .select('rating_changes.userId')
      .groupBy('rating_changes.userId')
      .having('COUNT(rating_changes.userId) > 2')
      .getRawMany();

    return players.map(({ userId }) => userId);
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
          security_code: (Math.random() * (99999 - 10000) + 10000).toString(),
        },
      ])
      .execute();
  }
}
