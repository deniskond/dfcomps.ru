import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../../auth/auth.service';
import {
  AdminActiveMulticupInterface,
  AdminMulticupActionInterface,
  AdminMulticupInterface,
  MulticupActionDto,
  MulticupSystems,
} from '@dfcomps/contracts';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserAccessInterface } from '../../../shared/interfaces/user-access.interface';
import { UserRoles, checkUserRoles } from '@dfcomps/auth';
import { Multicup } from '../../../shared/entities/multicup.entity';

@Injectable()
export class AdminMulticupsService {
  constructor(
    private readonly authService: AuthService,
    @InjectRepository(Multicup) private readonly multicupsRepository: Repository<Multicup>,
  ) {}

  public async getAllMulticups(accessToken: string | undefined): Promise<AdminMulticupInterface[]> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!checkUserRoles(userAccess.roles, [UserRoles.CUP_ORGANIZER, UserRoles.VALIDATOR])) {
      throw new UnauthorizedException('Unauthorized to get admin multicups list without CUP_ORGANIZER role');
    }

    const multicups: Multicup[] = await this.multicupsRepository
      .createQueryBuilder('multicups')
      .leftJoinAndSelect('multicups.cups', 'cups')
      .orderBy('multicups.id', 'DESC')
      .getMany();

    return multicups.map((multicup: Multicup) => ({
      id: multicup.id,
      name: multicup.name,
      rounds: multicup.rounds,
      isFinished: multicup.cups.length === multicup.rounds,
    }));
  }

  public async getSingleMulticup(
    accessToken: string | undefined,
    multicupId: number,
  ): Promise<AdminMulticupActionInterface> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!checkUserRoles(userAccess.roles, [UserRoles.CUP_ORGANIZER])) {
      throw new UnauthorizedException('Unauthorized to get admin multicup info without CUP_ORGANIZER role');
    }

    const multicup: Multicup | null = await this.multicupsRepository
      .createQueryBuilder('multicups')
      .where({ id: multicupId })
      .getOne();

    if (!multicup) {
      throw new NotFoundException(`Multicup with id = ${multicupId} not found`);
    }

    return {
      id: multicup.id,
      name: multicup.name,
      rounds: multicup.rounds,
    };
  }

  public async getAllActiveMulticups(): Promise<AdminActiveMulticupInterface[]> {
    const multicups: Multicup[] = await this.multicupsRepository
      .createQueryBuilder('multicups')
      .leftJoinAndSelect('multicups.cups', 'cups')
      .getMany();

    return multicups
      .filter((multicup: Multicup) => multicup.cups.length !== multicup.rounds)
      .map((multicup: Multicup) => ({
        multicupId: multicup.id,
        name: multicup.name,
      }));
  }

  public async addMulticup(accessToken: string | undefined, addMulticupDto: MulticupActionDto): Promise<void> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!checkUserRoles(userAccess.roles, [UserRoles.CUP_ORGANIZER])) {
      throw new UnauthorizedException('Unauthorized to add multicup without CUP_ORGANIZER role');
    }

    await this.multicupsRepository
      .createQueryBuilder()
      .insert()
      .into(Multicup)
      .values([
        {
          name: addMulticupDto.name,
          rounds: addMulticupDto.rounds,
          system: MulticupSystems.EE_DFWC,
        },
      ])
      .execute();
  }

  public async updateMulticup(
    accessToken: string | undefined,
    updateMulticupDto: MulticupActionDto,
    multicupId: number,
  ): Promise<void> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!checkUserRoles(userAccess.roles, [UserRoles.CUP_ORGANIZER])) {
      throw new UnauthorizedException('Unauthorized to edit multicup without CUP_ORGANIZER role');
    }

    const multicup: Multicup | null = await this.multicupsRepository
      .createQueryBuilder('multicups')
      .leftJoinAndSelect('multicups.cups', 'cups')
      .where({ id: multicupId })
      .getOne();

    if (!multicup) {
      throw new NotFoundException(`Multicup with id = ${multicupId} not found`);
    }

    if (multicup.cups.length === multicup.rounds) {
      throw new BadRequestException(`Can't update - multicup already finished`);
    }

    await this.multicupsRepository
      .createQueryBuilder()
      .update(Multicup)
      .set({
        name: updateMulticupDto.name,
        rounds: updateMulticupDto.rounds,
      })
      .where({ id: multicupId })
      .execute();
  }

  public async deleteMulticup(accessToken: string | undefined, multicupId: number): Promise<void> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!checkUserRoles(userAccess.roles, [UserRoles.CUP_ORGANIZER])) {
      throw new UnauthorizedException('Unauthorized to delete multicup without CUP_ORGANIZER role');
    }

    const multicup: Multicup | null = await this.multicupsRepository
      .createQueryBuilder('multicups')
      .leftJoinAndSelect('multicups.cups', 'cups')
      .where({ id: multicupId })
      .getOne();

    if (!multicup) {
      throw new NotFoundException(`Multicup with id = ${multicupId} not found`);
    }

    if (multicup.cups.length > 1) {
      throw new BadRequestException(`Can't delete - multicup already started`);
    }

    await this.multicupsRepository.createQueryBuilder().delete().from(Multicup).where({ id: multicupId }).execute();
  }
}
