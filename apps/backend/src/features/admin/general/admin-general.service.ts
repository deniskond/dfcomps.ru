import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cup } from '../../../shared/entities/cup.entity';
import { AuthService } from '../../auth/auth.service';
import { AdminTimerCupInterface } from '@dfcomps/contracts';
import { UserRoles, checkUserRoles } from '@dfcomps/auth';

@Injectable()
export class AdminGeneralService {
  constructor(
    @InjectRepository(Cup) private readonly cupsRepository: Repository<Cup>,
    private readonly authService: AuthService,
  ) {}

  public async getTimerCup(accessToken: string | undefined): Promise<AdminTimerCupInterface> {
    const userAccess = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!checkUserRoles(userAccess.roles, [UserRoles.ADMIN])) {
      throw new UnauthorizedException('Unauthorized to access general admin settings without ADMIN role');
    }

    const cup = await this.cupsRepository.findOne({ where: { timer: true } });

    return { currentTimerCupId: cup?.id ?? null };
  }

  public async setTimerCup(accessToken: string | undefined, rawCupId: number | null): Promise<void> {
    const userAccess = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!checkUserRoles(userAccess.roles, [UserRoles.ADMIN])) {
      throw new UnauthorizedException('Unauthorized to access general admin settings without ADMIN role');
    }

    const cupId: number | null = rawCupId === null || (rawCupId as unknown) === 'null' ? null : Number(rawCupId);

    if (cupId !== null) {
      const cup = await this.cupsRepository.findOne({ where: { id: cupId } });

      if (!cup) {
        throw new NotFoundException(`Cup with id = ${cupId} not found`);
      }
    }

    await this.cupsRepository.createQueryBuilder().update(Cup).set({ timer: false }).where('timer = true').execute();

    if (cupId !== null) {
      await this.cupsRepository.createQueryBuilder().update(Cup).set({ timer: true }).where({ id: cupId }).execute();
    }
  }
}
