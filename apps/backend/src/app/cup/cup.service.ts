import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cup } from './entities/cup.entity';
import { CheckCupRegistrationInterface, CupInterface } from '@dfcomps/contracts';
import { CupResult } from './entities/cup-result.entity';
import { AuthService } from '../auth/auth.service';
import { UserAccessInterface } from '../interfaces/user-access.interface';
import * as moment from 'moment';
import { mapCupEntityToInterface } from '../mappers/cup.mapper';

@Injectable()
export class CupService {
  constructor(
    @InjectRepository(Cup) private readonly cupRepository: Repository<Cup>,
    @InjectRepository(CupResult) private readonly cupResultRepository: Repository<CupResult>,
    private readonly authService: AuthService,
  ) {}

  public async getNextCupInfo(accessToken: string): Promise<CupInterface> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);
    const nextCup: Cup = await this.getNextCup();
    const serverInfo: CupResult | null = await this.cupResultRepository
      .createQueryBuilder('cups_results')
      .select('server')
      .where({
        cup: {
          id: nextCup.id,
        },
      })
      .andWhere({ user: { id: userAccess.userId } })
      .getOne();

    let server: string | null = null;

    if (serverInfo) {
      server = serverInfo.server === 1 ? nextCup.server1 : nextCup.server2;
    }

    const isFutureCup: boolean = moment(nextCup.start_datetime).isAfter(moment());

    return mapCupEntityToInterface(nextCup, isFutureCup, server, nextCup.news[0].id, nextCup.multicup.id);
  }

  public async checkIfPlayerRegistered(
    accessToken: string | undefined,
    cupId: number,
  ): Promise<CheckCupRegistrationInterface> {
    const { userId }: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    const playerCupRecordCount: number = await this.cupResultRepository
      .createQueryBuilder('cups_results')
      .where('cups_results.cupId = :cupId', { cupId })
      .andWhere('cups_results.userId = :userId', { userId })
      .getCount();

    return { isRegistered: !!playerCupRecordCount };
  }

  private async getNextCup(): Promise<Cup> {
    const cupWithTimer: Cup | null = await this.cupRepository
      .createQueryBuilder('cups')
      .leftJoinAndSelect('cups.news', 'news')
      .leftJoinAndSelect('cups.multicup', 'multicups')
      .where({ timer: true })
      .limit(1)
      .getOne();

    if (cupWithTimer) {
      return cupWithTimer;
    }

    const nextFutureCup: Cup | null = await this.cupRepository
      .createQueryBuilder('cups')
      .leftJoinAndSelect('cups.news', 'news')
      .leftJoinAndSelect('cups.multicup', 'multicups')
      .where('end_datetime > now()')
      .orderBy('end_datetime', 'ASC')
      .limit(1)
      .getOne();

    if (nextFutureCup) {
      return nextFutureCup;
    }

    const previousStartedCup: Cup = (await this.cupRepository
      .createQueryBuilder('cups')
      .leftJoinAndSelect('cups.news', 'news')
      .leftJoinAndSelect('cups.multicup', 'multicups')
      .orderBy('end_datetime', 'DESC')
      .limit(1)
      .getOne())!;

    return previousStartedCup;
  }
}
