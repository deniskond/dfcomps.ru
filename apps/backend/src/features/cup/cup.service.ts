import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CheckCupRegistrationInterface, CupInterface, ValidationArchiveLinkInterface } from '@dfcomps/contracts';
import { AuthService } from '../auth/auth.service';
import * as moment from 'moment';
import { Cup } from '../../shared/entities/cup.entity';
import { CupResult } from '../../shared/entities/cup-result.entity';
import { UserAccessInterface } from '../../shared/interfaces/user-access.interface';
import { mapCupEntityToInterface } from '../../shared/mappers/cup.mapper';
import { UserRoles, checkUserRoles } from '@dfcomps/auth';

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

    return mapCupEntityToInterface(nextCup, isFutureCup, server, nextCup.news[0].id, nextCup.multicup?.id || null);
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

  public async getValidationArchiveLink(
    accessToken: string | undefined,
    cupId: number,
  ): Promise<ValidationArchiveLinkInterface> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!userAccess.userId || !checkUserRoles(userAccess.roles, [UserRoles.VALIDATOR])) {
      throw new UnauthorizedException("Can't get demos for validation without VALIDATOR role");
    }

    return { accessToken, cupId } as any;
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
