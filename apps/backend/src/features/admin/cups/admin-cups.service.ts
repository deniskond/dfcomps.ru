import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../../auth/auth.service';
import { AdminCupDto, AdminCupInterface, AdminValidationInterface, CupTypes } from '@dfcomps/contracts';
import { InjectRepository } from '@nestjs/typeorm';
import { Cup } from '../../../shared/entities/cup.entity';
import { Repository } from 'typeorm';
import { getHumanTime } from '../../../shared/helpers/get-human-time';
import { UserAccessInterface } from '../../../shared/interfaces/user-access.interface';
import { UserRoles, checkUserRoles } from '@dfcomps/auth';

@Injectable()
export class AdminCupsService {
  constructor(
    private readonly authService: AuthService,
    @InjectRepository(Cup) private readonly cupsRepository: Repository<Cup>,
  ) {}

  public async getAllCups(accessToken: string | undefined): Promise<AdminCupInterface[]> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!checkUserRoles(userAccess.roles, [UserRoles.CUP_ORGANIZER])) {
      throw new UnauthorizedException('Unauthorized to get admin cups list without CUP_ORGANIZER role');
    }

    const cups: Cup[] = await this.cupsRepository.createQueryBuilder('cups').orderBy('id', 'DESC').getMany();

    return cups.map((cup: Cup) => ({
      id: cup.id,
      fullName: cup.full_name,
      duration: getHumanTime(cup.start_datetime) + ' - ' + getHumanTime(cup.end_datetime),
      physics: cup.physics,
      type: cup.type,
      validationAvailable: cup.rating_calculated === false && cup.type === CupTypes.OFFLINE,
    }));
  }

  public async getSingleCup(accessToken: string | undefined, cupId: number): Promise<any> {
    return {};
  }

  public async deleteCup(accessToken: string | undefined, cupId: number): Promise<void> {}

  public async addCup(accessToken: string | undefined, cupDto: AdminCupDto): Promise<void> {}

  public async updateCup(accessToken: string | undefined, cupDto: AdminCupDto, cupId: number): Promise<void> {}

  public async getValidationDemos(accessToken: string | undefined, cupId: number): Promise<AdminValidationInterface> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!checkUserRoles(userAccess.roles, [UserRoles.VALIDATOR])) {
      throw new UnauthorizedException('Unauthorized to get validation demos, VALIDATOR role needed');
    }

    return { accessToken, cupId } as any;
  }

  private async getPhysicsDemos(): Promise<any> {}
}
