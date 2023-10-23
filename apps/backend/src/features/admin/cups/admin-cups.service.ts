import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../../auth/auth.service';
import {
  AdminCupDto,
  AdminCupInterface,
  AdminPlayerDemosValidationInterface,
  AdminValidationInterface,
  CupTypes,
  Physics,
} from '@dfcomps/contracts';
import { InjectRepository } from '@nestjs/typeorm';
import { Cup } from '../../../shared/entities/cup.entity';
import { Repository } from 'typeorm';
import { getHumanTime } from '../../../shared/helpers/get-human-time';
import { UserAccessInterface } from '../../../shared/interfaces/user-access.interface';
import { UserRoles, checkUserRoles, isSuperadmin } from '@dfcomps/auth';
import * as moment from 'moment';
import { CupDemo } from '../../../shared/entities/cup-demo.entity';

@Injectable()
export class AdminCupsService {
  constructor(
    private readonly authService: AuthService,
    @InjectRepository(Cup) private readonly cupsRepository: Repository<Cup>,
    @InjectRepository(CupDemo) private readonly cupsDemosRepository: Repository<CupDemo>,
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

    const cup: Cup | null = await this.cupsRepository.createQueryBuilder('cups').where({ id: cupId }).getOne();

    if (!cup) {
      throw new NotFoundException(`Cup with id = ${cupId} not found`);
    }

    if (moment().isBefore(cup.end_datetime) && !isSuperadmin(userAccess.roles)) {
      throw new UnauthorizedException('Unauthorized to get demos before competition end');
    }

    return {
      cupInfo: {
        id: cupId,
        fullName: cup.full_name,
      },
      vq3Demos: await this.getPhysicsDemos(cupId, Physics.VQ3),
      cpmDemos: await this.getPhysicsDemos(cupId, Physics.CPM),
    };
  }

  private async getPhysicsDemos(cupId: number, physics: Physics): Promise<AdminPlayerDemosValidationInterface[]> {
    const demos: CupDemo[] = await this.cupsDemosRepository
      .createQueryBuilder('cups_demos')
      .leftJoinAndSelect('cups_demos.user', 'users')
      .where('cups_demos.cupId = :cupId', { cupId })
      .andWhere('cups_demos.physics = :physics', { physics })
      .getMany();

    const demosByPlayer: AdminPlayerDemosValidationInterface[] = demos.reduce<AdminPlayerDemosValidationInterface[]>(
      (demos: AdminPlayerDemosValidationInterface[], playerDemo: CupDemo) => {
        const playerDemoIndex = demos.findIndex(
          (demo: AdminPlayerDemosValidationInterface) => demo.nick === playerDemo.user.displayed_nick,
        );

        if (playerDemoIndex !== -1) {
          type Unpacked<T> = T extends (infer U)[] ? U : T;

          const addedDemo: Unpacked<AdminPlayerDemosValidationInterface['demos']> = {
            time: playerDemo.time,
            validationStatus: playerDemo.verified_status,
            validationFailedReason: playerDemo.reason,
            demoLink: `/uploads/demos/cup${cupId}/${playerDemo.demopath}`,
            id: playerDemo.id,
          };

          demos[playerDemoIndex].demos.push(addedDemo);

          return demos;
        }

        const addedDemo: AdminPlayerDemosValidationInterface = {
          nick: playerDemo.user.displayed_nick,
          country: playerDemo.user.country,
          demos: [
            {
              time: playerDemo.time,
              validationStatus: playerDemo.verified_status,
              validationFailedReason: playerDemo.reason,
              demoLink: `/uploads/demos/cup${cupId}/${playerDemo.demopath}`,
              id: playerDemo.id,
            },
          ],
        };

        return [...demos, addedDemo];
      },
      [],
    );

    const sortedDemos: AdminPlayerDemosValidationInterface[] = demosByPlayer
      .map((playerDemos: AdminPlayerDemosValidationInterface) => ({
        ...playerDemos,
        demos: playerDemos.demos.sort((demo1, demo2) => demo1.time - demo2.time),
      }))
      .sort((player1, player2) => player1.demos[0].time - player2.demos[0].time);

    return sortedDemos;
  }
}
