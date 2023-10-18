import {
  InvalidDemoInterface,
  LeaderTableInterface,
  MulticupResultInterface,
  MulticupSystems,
  Physics,
  PaginationCountInterface,
  RatingTablesModes,
  ResultsTableInterface,
  ValidDemoInterface,
  VerifiedStatuses,
  MulticupTableInterface,
  MulticupRoundInterface,
} from '@dfcomps/contracts';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../shared/entities/user.entity';
import { OneVOneRating } from '../../shared/entities/1v1-rating.entity';
import { RatingChange } from '../../shared/entities/rating-change.entity';
import { CupDemo } from '../../shared/entities/cup-demo.entity';
import { OldRating } from '../../shared/entities/old-rating.entity';
import { Cup } from '../../shared/entities/cup.entity';
import { CupResult } from '../../shared/entities/cup-result.entity';
import { getMapLevelshot } from '../../shared/helpers/get-map-levelshot';

type MultiCupTableWithPoints = {
  valid: (ValidDemoInterface & { eePoints: number })[];
  invalid: InvalidDemoInterface[];
};

@Injectable()
export class TablesService {
  private readonly PLAYERS_ON_RATING_PAGE = 100;

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(OneVOneRating) private readonly oneVOneRatingRepository: Repository<OneVOneRating>,
    @InjectRepository(RatingChange) private readonly ratingChangeRepository: Repository<RatingChange>,
    @InjectRepository(Cup) private readonly cupsRepository: Repository<Cup>,
    @InjectRepository(CupResult) private readonly cupsResultsRepository: Repository<CupResult>,
    @InjectRepository(CupDemo) private readonly cupsDemosRepository: Repository<CupDemo>,
    @InjectRepository(OldRating) private readonly oldRatingsRepository: Repository<OldRating>,
  ) {}

  public async getTop10(physics: Physics, mode: RatingTablesModes): Promise<LeaderTableInterface[]> {
    if (mode === RatingTablesModes.CLASSIC) {
      const top10Users: User[] = await this.userRepository
        .createQueryBuilder()
        .orderBy(`${physics}_rating`, 'DESC')
        .limit(10)
        .getMany();

      return top10Users.map(({ displayed_nick, cpm_rating, vq3_rating, id, country }: User) => ({
        playerId: id,
        nick: displayed_nick,
        country,
        rating: physics === Physics.CPM ? cpm_rating : vq3_rating,
      }));
    }

    const top10Users: OneVOneRating[] = await this.oneVOneRatingRepository
      .createQueryBuilder('1v1_rating')
      .innerJoinAndSelect('1v1_rating.user', 'user')
      .orderBy(`${physics}`, 'DESC')
      .limit(10)
      .getMany();

    return top10Users.map((result) => ({
      playerId: result.user.id,
      nick: result.user.displayed_nick,
      country: result.user.country,
      rating: physics === Physics.CPM ? result.cpm : result.vq3,
    }));
  }

  public async getOfflineCupTable(cup: Cup, physics: Physics): Promise<ResultsTableInterface> {
    const cupDemos: CupDemo[] = await this.cupsDemosRepository
      .createQueryBuilder('cups_demos')
      .leftJoinAndSelect('cups_demos.user', 'users')
      .leftJoinAndSelect('users.ratingChanges', 'rating_changes', 'cups_demos.cupId = rating_changes.cupId')
      .where('cups_demos.physics = :physics', { physics })
      .andWhere('cups_demos.cupId = :cupId', { cupId: cup.id })
      .getMany();

    const invalidDemos: InvalidDemoInterface[] = cupDemos
      .filter(({ verified_status }: CupDemo) => verified_status === VerifiedStatuses.INVALID)
      .map((cupDemo: CupDemo) => ({
        demopath: cupDemo.demopath,
        nick: cupDemo.user.displayed_nick,
        reason: cupDemo.reason!,
        time: cupDemo.time,
      }));

    const validDemos: ValidDemoInterface[] = cupDemos
      .filter(
        ({ verified_status }: CupDemo) =>
          verified_status === VerifiedStatuses.VALID || verified_status === VerifiedStatuses.UNWATCHED,
      )
      .reduce((demos: ValidDemoInterface[], demo: CupDemo) => {
        const ratingChange: number | null =
          physics === Physics.CPM
            ? demo.user.ratingChanges[0]?.cpm_change || null
            : demo.user.ratingChanges[0]?.vq3_change || null;

        const mappedDemo: ValidDemoInterface = {
          bonus: demo.user.ratingChanges[0]?.bonus || null,
          change: ratingChange,
          country: demo.user.country,
          demopath: demo.demopath,
          impressive: demo.impressive,
          nick: demo.user.displayed_nick,
          playerId: demo.user.id,
          rating: physics === Physics.CPM ? demo.user.cpm_rating : demo.user.vq3_rating,
          time: demo.time,
        };

        const previousBestDemo: ValidDemoInterface | undefined = demos.find(
          ({ playerId }: ValidDemoInterface) => playerId === demo.user.id,
        );

        if (!previousBestDemo) {
          return [...demos, mappedDemo];
        }

        return previousBestDemo.time > mappedDemo.time
          ? [...demos.filter(({ playerId }: ValidDemoInterface) => playerId != demo.user.id), mappedDemo]
          : demos;
      }, [])
      .sort((demo1: ValidDemoInterface, demo2: ValidDemoInterface) => demo1.time - demo2.time);

    const result: ResultsTableInterface = {
      valid: validDemos,
      invalid: invalidDemos,
    };

    return result;
  }

  // TODO Move to a new module which will be used be News And Tables services
  public async getMulticupTable(
    multicupId: number,
    cups: Cup[],
    physics: Physics,
    system: MulticupSystems,
  ): Promise<MulticupResultInterface[]> {
    const singleCupTables: ResultsTableInterface[] = await Promise.all(
      cups.map((cup: Cup) => this.getOfflineCupTable(cup, physics)),
    );

    const tablesWithPoints: MultiCupTableWithPoints[] =
      system === MulticupSystems.SDC
        ? this.getSdcMulticupTable(singleCupTables)
        : this.getEEMulticupTable(singleCupTables, system);

    // results without subtraction of min round and rating changes
    let multicupResults: MulticupResultInterface[] = this.getFullMulticupResultTable(tablesWithPoints);

    if ((system === MulticupSystems.EE_ALMERA || system === MulticupSystems.EE_KOZ) && singleCupTables.length > 3) {
      multicupResults = this.subtractMinRound(multicupResults);
    }

    multicupResults = await this.mapRatingChanges(multicupResults, multicupId, physics);

    return multicupResults;
  }

  public async getPhysicsRatingByPage(physics: Physics, page: number): Promise<LeaderTableInterface[]> {
    const limitStart = this.PLAYERS_ON_RATING_PAGE * (page - 1);
    const users: User[] = await this.userRepository
      .createQueryBuilder('users')
      .where(`users.${physics}_rating != 0`)
      .andWhere(`users.${physics}_rating != 1500`)
      .orderBy(`users.${physics}_rating`, 'DESC')
      .offset(limitStart)
      .limit(this.PLAYERS_ON_RATING_PAGE)
      .getMany();

    return users.map((user: User) => ({
      playerId: user.id,
      nick: user.displayed_nick,
      country: user.country,
      rating: user[`${physics}_rating`],
    }));
  }

  public async getSeasonPhysicsRatingByPage(
    physics: Physics,
    page: number,
    season: number,
  ): Promise<LeaderTableInterface[]> {
    const limitStart: number = this.PLAYERS_ON_RATING_PAGE * (page - 1);
    const oldRatings: OldRating[] = await this.oldRatingsRepository
      .createQueryBuilder('old_ratings')
      .leftJoinAndSelect('old_ratings.user', 'users')
      .where(`old_ratings.${physics}_rating != 0`)
      .andWhere(`old_ratings.${physics}_rating != 1500`)
      .andWhere('old_ratings.season = :season', { season })
      .orderBy(`old_ratings.${physics}_rating`, 'DESC')
      .offset(limitStart)
      .limit(this.PLAYERS_ON_RATING_PAGE)
      .getMany();

    return oldRatings.map((oldRating: OldRating) => ({
      playerId: oldRating.user.id,
      nick: oldRating.user.displayed_nick,
      country: oldRating.user.country,
      rating: oldRating[`${physics}_rating`],
    }));
  }

  public async getRatingTablePlayersCount(): Promise<PaginationCountInterface> {
    const vq3PlayersCount: number = await this.userRepository
      .createQueryBuilder('users')
      .where('vq3_rating != 0')
      .andWhere('vq3_rating != 1500')
      .getCount();

    const cpmPlayersCount: number = await this.userRepository
      .createQueryBuilder('users')
      .where('cpm_rating != 0')
      .andWhere('cpm_rating != 1500')
      .getCount();

    return {
      count: vq3PlayersCount > cpmPlayersCount ? vq3PlayersCount : cpmPlayersCount,
    };
  }

  public async getSeasonRatingTablePlayersCount(season: number): Promise<PaginationCountInterface> {
    const vq3PlayersCount: number = await this.oldRatingsRepository
      .createQueryBuilder('old_ratings')
      .where('vq3_rating != 0')
      .andWhere('vq3_rating != 1500')
      .andWhere('season = :season', { season })
      .getCount();

    const cpmPlayersCount: number = await this.oldRatingsRepository
      .createQueryBuilder('old_ratings')
      .where('cpm_rating != 0')
      .andWhere('cpm_rating != 1500')
      .andWhere('season = :season', { season })
      .getCount();

    return {
      count: vq3PlayersCount > cpmPlayersCount ? vq3PlayersCount : cpmPlayersCount,
    };
  }

  public async getOnlineCupFullTable(cupId: number): Promise<MulticupTableInterface> {
    const cup: Cup | null = await this.cupsRepository.createQueryBuilder('cups').where({ id: cupId }).getOne();

    if (!cup) {
      throw new NotFoundException(`Cup with id = ${cupId} not found`);
    }

    const cupResults: CupResult[] = await this.cupsResultsRepository
      .createQueryBuilder('cups_results')
      .leftJoinAndSelect('cups_results.user', 'users')
      .where('cups_results.cupId = :cupId', { cupId })
      .getMany();

    if (cup.system === MulticupSystems.LEGACY) {
      const playersResults: MulticupResultInterface[] = cupResults
        .map((cupResult: CupResult) => {
          const roundResults: number[] = [
            cupResult.round1,
            cupResult.round2,
            cupResult.round3,
            cupResult.round4,
            cupResult.round5,
          ];

          const overall = roundResults.reduce<number>(
            (sum, roundResult) => (roundResult === 0 ? sum : sum + cupResults.length - roundResult + 1),
            0,
          );

          return {
            playerId: cupResult.user.id,
            playerNick: cupResult.user.displayed_nick,
            playerCountry: cupResult.user.country,
            roundResults,
            overall,
            minround: null,
            ratingChange: null,
          };
        })
        .sort((playerResult1, playerResult2) => playerResult2.overall - playerResult1.overall);

      return {
        fullName: cup.full_name,
        rounds: 5,
        currentRound: 6, // legacy value, used as indicator that cup is finished
        physics: cup.physics as Physics,
        system: MulticupSystems.LEGACY,
        players: playersResults,
        shortName: cup.short_name,
      };
    }

    // Last EE_KOZ online cup was CPM Rocketruns (was not changed to EE_DFWC previously because of legacy code)
    const system = cup.id <= 380 ? MulticupSystems.EE_KOZ : MulticupSystems.EE_DFWC;

    const playersResults: MulticupResultInterface[] = await this.getOnlineCupResults(cup, cupResults, system);

    return {
      fullName: cup.full_name,
      rounds: 5,
      currentRound: cup.current_round,
      physics: cup.physics as Physics,
      system,
      players: playersResults,
      shortName: cup.short_name,
    };
  }

  public async getOnlineCupResults(
    cup: Cup,
    cupResults: CupResult[],
    system: MulticupSystems,
  ): Promise<MulticupResultInterface[]> {
    const cupMaps: (string | null)[] = [cup.map1, cup.map2, cup.map3, cup.map4, cup.map5];
    const roundsPlayed: number = cupMaps.filter((map) => !!map).length;

    if (roundsPlayed === 0) {
      return cupResults.map((cupResult: CupResult) => ({
        playerId: cupResult.user.id,
        playerNick: cupResult.user.displayed_nick,
        playerCountry: cupResult.user.country,
        roundResults: [],
        overall: 0,
        minround: null,
        ratingChange: null,
      }));
    }

    // Hack to emulate several offline cups from one online cup and use getEEMulticupTable method
    const onlineCupAdaptedTables: ResultsTableInterface[] = new Array(roundsPlayed).fill(null).map((_, index) => {
      return {
        valid: cupResults
          .map((cupResult: CupResult) => ({
            bonus: null,
            change: null,
            country: cupResult.user.country,
            demopath: '',
            impressive: false,
            nick: cupResult.user.displayed_nick,
            playerId: cupResult.user.id,
            rating: 0,
            time: cupResult[`time${index + 1}` as keyof CupResult] as number,
          }))
          .filter((result: ValidDemoInterface) => !!result.time)
          .sort((result1, result2) => result1.time - result2.time),
        invalid: [],
      };
    });

    const onlineCupAdaptedTablesWithPoints: MultiCupTableWithPoints[] = this.getEEMulticupTable(
      onlineCupAdaptedTables,
      system,
    );

    return this.getFullMulticupResultTable(onlineCupAdaptedTablesWithPoints);
  }

  public async getOnlineCupRound(cupId: number, roundNumber: number): Promise<MulticupRoundInterface> {
    if (roundNumber < 1 || roundNumber > 5) {
      throw new BadRequestException('Round number should be from 1 to 5');
    }

    const cupResults: CupResult[] = await this.cupsResultsRepository
      .createQueryBuilder('cups_results')
      .leftJoinAndSelect('cups_results.user', 'users')
      .where('cups_results.cupId = :cupId', { cupId })
      .andWhere(`cups_results.time${roundNumber} != 0`)
      .orderBy(`cups_results.time${roundNumber}`)
      .getMany();

    if (!cupResults.length) {
      throw new NotFoundException(`Cup results for cup with id ${cupId} not found`);
    }

    const cup: Cup = (await this.cupsRepository.createQueryBuilder('cups').where({ id: cupId }).getOne())!;
    const map: string | null = cup[`map${roundNumber}` as keyof Cup] as string | null;

    if (!map) {
      throw new BadRequestException("Round haven't been played yet");
    }

    return {
      fullName: cup.full_name,
      map,
      levelshot: getMapLevelshot(map),
      resultsTable: cupResults.map((cupResult: CupResult) => ({
        playerId: cupResult.user.id,
        time: cupResult[`time${roundNumber}` as keyof CupResult] as number,
        nick: cupResult.user.displayed_nick,
        country: cupResult.user.country,
      })),
      physics: cup.physics as Physics,
      hasPoints: false,
      shortName: cup.short_name,
    };
  }

  private getFullMulticupResultTable(tablesWithPoints: MultiCupTableWithPoints[]): MulticupResultInterface[] {
    let multicupResults: MulticupResultInterface[] = [];

    tablesWithPoints.forEach((table: MultiCupTableWithPoints, roundIndex: number) => {
      table.valid.forEach((result: ValidDemoInterface & { eePoints: number }) => {
        const playerRecordIndex: number = multicupResults.findIndex(
          (playerRecord: MulticupResultInterface) => playerRecord.playerId === result.playerId,
        );

        if (playerRecordIndex !== -1) {
          multicupResults[playerRecordIndex].roundResults[roundIndex] = result.eePoints;
          multicupResults[playerRecordIndex].overall += result.eePoints;
        } else {
          const roundResults: number[] = [];

          roundResults[roundIndex] = result.eePoints;

          multicupResults.push({
            playerId: result.playerId,
            playerNick: result.nick,
            playerCountry: result.country,
            roundResults,
            overall: result.eePoints,
            minround: null, // is mapped after if needed
            ratingChange: null, // is mapped after if needed
          });
        }
      });
    });

    return multicupResults.sort((a: MulticupResultInterface, b: MulticupResultInterface) => b.overall - a.overall);
  }

  /** Legacy, only used by old systems (EE_KOZ, EE_ALMERA) */
  private subtractMinRound(multicupResults: MulticupResultInterface[]): MulticupResultInterface[] {
    return multicupResults.map((multicupResult: MulticupResultInterface) => {
      let minRoundResult: number = Infinity;
      let minRoundIndex: number | null = null;

      multicupResult.roundResults.forEach((result: number | null, index: number) => {
        if (result !== null && result < minRoundResult) {
          minRoundResult = result;
          minRoundIndex = index;
        }
      });

      return {
        ...multicupResult,
        overall: multicupResult.overall - minRoundResult,
        minround: minRoundIndex === null ? null : minRoundIndex + 1,
      };
    });
  }

  private async mapRatingChanges(
    multicupResults: MulticupResultInterface[],
    multicupId: number,
    physics: Physics,
  ): Promise<MulticupResultInterface[]> {
    const ratingChanges: RatingChange[] = await this.ratingChangeRepository
      .createQueryBuilder('rating_changes')
      .leftJoinAndSelect('rating_changes.user', 'users')
      .where('rating_changes.multicupId = :multicupId', { multicupId })
      .getMany();

    return multicupResults.map((multicupResult: MulticupResultInterface) => {
      const playerRatingChangeRecord: RatingChange | undefined = ratingChanges.find(
        (ratingChange: RatingChange) => ratingChange.user.id === multicupResult.playerId,
      );
      let ratingChange: number | null = null;

      if (playerRatingChangeRecord) {
        ratingChange =
          physics === Physics.CPM ? playerRatingChangeRecord.cpm_change : playerRatingChangeRecord.vq3_change;
      }

      return { ...multicupResult, ratingChange };
    });
  }

  private getSdcMulticupTable(singleCupTables: ResultsTableInterface[]): MultiCupTableWithPoints[] {
    return singleCupTables.map((table: ResultsTableInterface) => {
      const topTime: number = table.valid[0].time;

      return {
        valid: table.valid.map((validDemo: ValidDemoInterface) => {
          let eePoints = Number((20 - (validDemo.time - topTime)).toFixed(3));

          if (eePoints < 0) {
            eePoints = 0;
          }

          return { ...validDemo, eePoints };
        }),
        invalid: table.invalid,
      };
    });
  }

  private getEEMulticupTable(
    singleCupTables: ResultsTableInterface[],
    system: MulticupSystems,
  ): MultiCupTableWithPoints[] {
    return singleCupTables.map((table: ResultsTableInterface) => {
      const topTime: number = table.valid[0].time;
      let currentPlace = 1;

      return {
        valid: table.valid.map((validDemo: ValidDemoInterface, index: number) => {
          let eePoints: number;

          if (index === 0) {
            eePoints = 1000;
          } else {
            if (table.valid[index].time !== table.valid[index - 1].time) {
              currentPlace++;
            }

            const k1 = topTime / validDemo.time;
            const k2 = this.countK2(currentPlace, system);

            eePoints = Math.round(k1 * k2 * 1000);
          }

          return {
            ...validDemo,
            eePoints,
          };
        }),
        invalid: [],
      };
    });
  }

  private countK2(place: number, system: MulticupSystems): number {
    let k2: number;

    if (system === MulticupSystems.EE_ALMERA) {
      if (place === 1) {
        k2 = 1;
      } else if (place === 2) {
        k2 = 0.97;
      } else if (place === 3) {
        k2 = 0.94;
      } else if (place === 4) {
        k2 = 0.92;
      } else if (place === 5) {
        k2 = 0.9;
      } else if (place <= 50) {
        k2 = 0.9 - (place - 5) / 100;
      } else if (place <= 100) {
        k2 = 0.9 - 45 / 100 - (place - 50) / 200;
      } else {
        k2 = 0.9 - 45 / 100 - (100 - 50) / 200 - (place - 100) / 400;
      }

      if (k2 <= 0.01) {
        k2 = 0.01;
      }

      return k2;
    } else if (system === MulticupSystems.EE_KOZ) {
      if (place === 1) {
        k2 = 1;
      } else if (place === 2) {
        k2 = 0.98;
      } else if (place === 3) {
        k2 = 0.965;
      } else if (place === 4) {
        k2 = 0.953;
      } else if (place === 5) {
        k2 = 0.942;
      } else if (place <= 50) {
        k2 = 0.942 - (place - 5) / 100;
      } else if (place <= 100) {
        k2 = 0.942 - 45 / 100 - (place - 50) / 200;
      } else {
        k2 = 0.942 - 45 / 100 - (100 - 50) / 200 - (place - 100) / 400;
      }

      if (k2 <= 0.01) {
        k2 = 0.01;
      }

      return k2;
    } else if (system === MulticupSystems.EE_DFWC) {
      if (place === 1) {
        k2 = 1;
      } else if (place === 2) {
        k2 = 0.99;
      } else if (place === 3) {
        k2 = 0.98;
      } else if (place === 4) {
        k2 = 0.97;
      } else if (place === 5) {
        k2 = 0.96;
      } else if (place <= 50) {
        k2 = 0.96 - (place - 5) / 100;
      } else if (place <= 100) {
        k2 = 0.96 - 45 / 100 - (place - 50) / 200;
      } else {
        k2 = 0.96 - 45 / 100 - (100 - 50) / 200 - (place - 100) / 400;
      }

      if (k2 <= 0.01) {
        k2 = 0.01;
      }

      return k2;
    }

    return 0;
  }
}
