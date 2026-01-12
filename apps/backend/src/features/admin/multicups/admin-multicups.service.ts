import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../../auth/auth.service';
import {
  AdminActiveMulticupInterface,
  AdminMulticupActionInterface,
  AdminMulticupInterface,
  MulticupActionDto,
  MulticupSystems,
  MulticupTableInterface,
  Physics,
} from '@dfcomps/contracts';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { UserAccessInterface } from '../../../shared/interfaces/user-access.interface';
import { UserRoles, checkUserRoles } from '@dfcomps/auth';
import { Multicup } from '../../../shared/entities/multicup.entity';
import { TablesService } from '../../tables/tables.service';
import { User } from '../../../shared/entities/user.entity';
import { RatingChange } from '../../../shared/entities/rating-change.entity';
import { Season } from '../../../shared/entities/season.entity';

interface MulticupResultRatingCalculationInterface {
  playerId: number;
  rating: number;
  overall: number;
  isAllMapsParticipation: boolean;
}

interface TablePlaceWithRatingInterface {
  playerId: number;
  rating: number;
  ratingChange: number;
  placeInTable: number;
  overall: number;
  isAllMapsParticipation: boolean;
}

@Injectable()
export class AdminMulticupsService {
  constructor(
    private readonly authService: AuthService,
    private readonly tablesService: TablesService,
    @InjectRepository(Multicup) private readonly multicupsRepository: Repository<Multicup>,
    @InjectRepository(Season) private readonly seasonRepository: Repository<Season>,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(RatingChange) private readonly ratingChangesRepository: Repository<RatingChange>,
  ) {}

  public async getAllMulticups(accessToken: string | undefined): Promise<AdminMulticupInterface[]> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!checkUserRoles(userAccess.roles, [UserRoles.CUP_ORGANIZER, UserRoles.VALIDATOR, UserRoles.NEWSMAKER])) {
      throw new UnauthorizedException('Unauthorized to get admin multicups list without appropriate role');
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
      isFinished: !!multicup.isFinished,
      isRatingCalculated: !!multicup.isRatingCalculated,
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
          isFinished: false,
          isRatingCalculated: false,
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

  public async finishMulticup(accessToken: string | undefined, multicupId: number): Promise<void> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!checkUserRoles(userAccess.roles, [UserRoles.CUP_ORGANIZER])) {
      throw new UnauthorizedException('Unauthorized to finish multicup without CUP_ORGANIZER role');
    }

    const multicup: Multicup | null = await this.multicupsRepository
      .createQueryBuilder('multicups')
      .leftJoinAndSelect('multicups.cups', 'cups')
      .where({ id: multicupId })
      .getOne();

    if (!multicup) {
      throw new NotFoundException(`Multicup with id = ${multicupId} not found`);
    }

    await this.multicupsRepository
      .createQueryBuilder()
      .update(Multicup)
      .set({ isFinished: true })
      .where({ id: multicupId })
      .execute();
  }

  public async calculateMulticupEERatings(accessToken: string | undefined, multicupId: number): Promise<void> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!checkUserRoles(userAccess.roles, [UserRoles.CUP_ORGANIZER])) {
      throw new UnauthorizedException('Unauthorized to calculate multicup EE ratings without CUP_ORGANIZER role');
    }

    const multicup: Multicup | null = await this.multicupsRepository
      .createQueryBuilder('multicups')
      .leftJoinAndSelect('multicups.cups', 'cups')
      .where({ id: multicupId })
      .getOne();

    if (!multicup) {
      throw new NotFoundException(`Multicup with id = ${multicupId} not found`);
    }

    if (multicup.isRatingCalculated) {
      throw new BadRequestException(`Multicup ratings are already calculated`);
    }

    const multicupTableVQ3: MulticupTableInterface = await this.tablesService.getMulticupTableForMulticupPage(
      multicupId,
      Physics.VQ3,
    );

    await this.calculateRatings(multicupTableVQ3, Physics.VQ3, multicupId);

    const multicupTableCPM: MulticupTableInterface = await this.tablesService.getMulticupTableForMulticupPage(
      multicupId,
      Physics.CPM,
    );

    await this.calculateRatings(multicupTableCPM, Physics.CPM, multicupId);

    await this.multicupsRepository
      .createQueryBuilder()
      .update(Multicup)
      .set({ isRatingCalculated: true })
      .where({ id: multicupId })
      .execute();
  }

  private async calculateRatings(
    multicupTable: MulticupTableInterface,
    physics: Physics,
    multicupId: number,
  ): Promise<void> {
    let tableForCalculations: MulticupResultRatingCalculationInterface[] = multicupTable.players.map((player) => ({
      playerId: player.playerId,
      rating: player.playerRating!,
      overall: player.overall,
      isAllMapsParticipation:
        Array.from(player.roundResults).every((result) => !!result) &&
        player.roundResults.length === multicupTable.rounds,
    }));

    let averageRating = 0;

    tableForCalculations = tableForCalculations.map((demo: MulticupResultRatingCalculationInterface) => {
      const demoRating = demo.rating === 0 ? 1500 : demo.rating;

      averageRating += demoRating;

      return { ...demo, rating: demoRating };
    });

    averageRating /= tableForCalculations.length;

    let currentResultCounter = 1;
    let onlyBonusRatingPlayersCount = 0;

    let tableWithCalculatedRatings: TablePlaceWithRatingInterface[] = tableForCalculations.map(
      (result: MulticupResultRatingCalculationInterface, index: number) => {
        let currentPlayerPlace: number;

        if (index === 0) {
          currentPlayerPlace = 1;
        } else {
          if (result.overall !== tableForCalculations[index - 1].overall) {
            currentResultCounter++;
          }

          currentPlayerPlace = currentResultCounter;
        }

        const efficiency: number = 1 - (currentPlayerPlace - 1) / tableForCalculations.length;
        const expectation: number = 1 / (1 + Math.pow(10, (averageRating - result.rating) / 400));
        let ratingChange: number = Math.round(70 * (efficiency - expectation));
        let sub2KBonusRatingChange: number = 0;

        if (result.rating < 2000) {
          if (ratingChange < 0) {
            sub2KBonusRatingChange = 10 - onlyBonusRatingPlayersCount;
            sub2KBonusRatingChange = sub2KBonusRatingChange < 1 ? 1 : sub2KBonusRatingChange;
            onlyBonusRatingPlayersCount++;
          } else {
            sub2KBonusRatingChange = 10;
          }
        }

        ratingChange += sub2KBonusRatingChange;

        return {
          playerId: result.playerId,
          rating: result.rating,
          ratingChange,
          placeInTable: currentPlayerPlace,
          overall: result.overall,
          isAllMapsParticipation: result.isAllMapsParticipation,
        };
      },
    );

    tableWithCalculatedRatings = this.addTop3BonusRatings(tableWithCalculatedRatings);
    tableWithCalculatedRatings = this.recalculateChangeFor1700(tableWithCalculatedRatings);
    tableWithCalculatedRatings = this.recalculatePartialParticipation(tableWithCalculatedRatings);

    const playersUpdate: Partial<User>[] = tableWithCalculatedRatings.map(
      ({ playerId, ratingChange, rating }: TablePlaceWithRatingInterface) => ({
        id: playerId,
        [`${physics}_rating`]: rating + ratingChange,
      }),
    );

    const { season }: Season = (await this.seasonRepository.createQueryBuilder('season').getOne())!;

    const ratingChanges: DeepPartial<RatingChange>[] = tableWithCalculatedRatings.map(
      (tableEntry: TablePlaceWithRatingInterface) => {
        return {
          cpm_change: physics === Physics.CPM ? tableEntry.ratingChange : null,
          vq3_change: physics === Physics.VQ3 ? tableEntry.ratingChange : null,
          cpm_place: physics === Physics.CPM ? tableEntry.placeInTable : null,
          vq3_place: physics === Physics.VQ3 ? tableEntry.placeInTable : null,
          season,
          bonus: false,
          user: { id: tableEntry.playerId },
          cup: null,
          multicup: { id: multicupId },
        };
      },
    );

    await this.usersRepository.save(playersUpdate);
    await this.ratingChangesRepository.createQueryBuilder().insert().into(RatingChange).values(ratingChanges).execute();
  }

  /**
   * Counting bonus points (+15 +10 +5 for 3 players, +50 +30 +20 for 30+ players)
   * @param table
   */
  private addTop3BonusRatings(table: TablePlaceWithRatingInterface[]): TablePlaceWithRatingInterface[] {
    const resultTable: TablePlaceWithRatingInterface[] = [...table];
    let bonusCoefficientForNumberOfPlayers = (resultTable.length - 3) / 27;

    if (bonusCoefficientForNumberOfPlayers < 0) {
      bonusCoefficientForNumberOfPlayers = 0;
    }

    if (bonusCoefficientForNumberOfPlayers > 1) {
      bonusCoefficientForNumberOfPlayers = 1;
    }

    const firstPlaceBonus = Math.round(bonusCoefficientForNumberOfPlayers * (50 - 15) + 15);
    const secondPlaceBonus = Math.round(bonusCoefficientForNumberOfPlayers * (30 - 10) + 10);
    const thirdPlaceBonus = Math.round(bonusCoefficientForNumberOfPlayers * (20 - 5) + 5);

    resultTable[0].ratingChange += firstPlaceBonus;

    let playerIndex = 1;

    while (
      playerIndex < resultTable.length &&
      resultTable[playerIndex].overall === resultTable[playerIndex - 1].overall
    ) {
      resultTable[playerIndex].ratingChange += firstPlaceBonus;
      playerIndex++;
    }

    if (playerIndex < resultTable.length) {
      resultTable[playerIndex].ratingChange += secondPlaceBonus;
      playerIndex++;
    }

    while (
      playerIndex < resultTable.length &&
      resultTable[playerIndex].overall === resultTable[playerIndex - 1].overall
    ) {
      resultTable[playerIndex].ratingChange += secondPlaceBonus;
      playerIndex++;
    }

    if (playerIndex < resultTable.length) {
      resultTable[playerIndex].ratingChange += thirdPlaceBonus;
      playerIndex++;
    }

    while (
      playerIndex < resultTable.length &&
      resultTable[playerIndex].overall === resultTable[playerIndex - 1].overall
    ) {
      resultTable[playerIndex].ratingChange += thirdPlaceBonus;
      playerIndex++;
    }

    return resultTable;
  }

  private recalculateChangeFor1700(table: TablePlaceWithRatingInterface[]): TablePlaceWithRatingInterface[] {
    return table.map((tableEntry: TablePlaceWithRatingInterface) => {
      let ratingChange = tableEntry.ratingChange;

      if (tableEntry.rating >= 1700 && tableEntry.rating + ratingChange < 1700) {
        ratingChange = 1700 - tableEntry.rating;
      }

      if (tableEntry.rating < 1700 && ratingChange <= 0) {
        ratingChange = 1;
      }

      return {
        ...tableEntry,
        ratingChange,
      };
    });
  }

  private recalculatePartialParticipation(table: TablePlaceWithRatingInterface[]): TablePlaceWithRatingInterface[] {
    let currentPlayerCounter = 0;

    return table.map((tableEntry: TablePlaceWithRatingInterface) => {
      if (!tableEntry.isAllMapsParticipation && tableEntry.ratingChange <= 1) {
        const ratingChange = 10 - currentPlayerCounter;

        currentPlayerCounter++;

        return {
          ...tableEntry,
          ratingChange: ratingChange > 0 ? ratingChange : 1,
        };
      }

      return tableEntry;
    });
  }
}
