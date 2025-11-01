import {
  BadRequestException,
  Injectable,
  NotFoundException,
  NotImplementedException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CheckCupRegistrationInterface,
  CupInterface,
  Physics,
  ResultsTableInterface,
  ValidDemoInterface,
  ArchiveLinkInterface,
  OnlineCupInfoInterface,
  CupTypes,
  CheckPreviousCupsType,
  ParsedMapInfoInterface,
  MapRatingInterface,
  MapType,
} from '@dfcomps/contracts';
import { AuthService } from '../auth/auth.service';
import * as moment from 'moment';
import { Cup } from '../../shared/entities/cup.entity';
import { CupResult } from '../../shared/entities/cup-result.entity';
import { UserAccessInterface } from '../../shared/interfaces/user-access.interface';
import { mapCupEntityToInterface } from '../../shared/mappers/cup.mapper';
import { UserRoles, checkUserRoles } from '@dfcomps/auth';
import { TablesService } from '../tables/tables.service';
import * as fs from 'fs';
import * as path from 'path';
import * as archiver from 'archiver';
import { CupDemo } from '../../shared/entities/cup-demo.entity';
import { v4 } from 'uuid';
import { User } from '../../shared/entities/user.entity';
import { getNextWarcupTime, mapWeaponsToString } from '@dfcomps/helpers';
import { MapSuggestion } from '../../shared/entities/map-suggestion.entity';
import { LevelshotsService } from '../../shared/services/levelshots.service';
import { OLD_WARCUP_MAPS } from './old-warcup-maps';
import { CupReview } from '../../shared/entities/cups-reviews.entity';
import { MapParsingService } from '../../shared/services/map-parsing.service';

@Injectable()
export class CupService {
  constructor(
    @InjectRepository(Cup) private readonly cupRepository: Repository<Cup>,
    @InjectRepository(CupResult) private readonly cupResultRepository: Repository<CupResult>,
    @InjectRepository(CupDemo) private readonly cupDemosRepository: Repository<CupDemo>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(MapSuggestion) private readonly mapSuggestionRepository: Repository<MapSuggestion>,
    @InjectRepository(CupReview) private readonly cupReviewRepository: Repository<CupReview>,
    private readonly authService: AuthService,
    private readonly tablesService: TablesService,
    private readonly mapParsingService: MapParsingService,
    private readonly levelshotsService: LevelshotsService,
  ) {}

  public async getNextCupInfo(accessToken: string | undefined): Promise<CupInterface> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);
    const nextCup: Cup = await this.getNextCup();
    let serverInfo: CupResult | null = null;

    if (userAccess.userId) {
      serverInfo = await this.cupResultRepository
        .createQueryBuilder('cups_results')
        .where({
          cup: {
            id: nextCup.id,
          },
        })
        .andWhere({ user: { id: userAccess.userId } })
        .getOne();
    }

    let server: string | null = null;

    if (serverInfo) {
      server = serverInfo.server === 1 ? nextCup.server1 : nextCup.server2;
    }

    const isFutureCup: boolean = moment(nextCup.start_datetime).isAfter(moment());

    return mapCupEntityToInterface(
      nextCup,
      isFutureCup,
      server,
      nextCup.news[0]?.id || null,
      nextCup.multicup?.id || null,
    );
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

  public async getValidationArchiveLink(accessToken: string | undefined, cupId: number): Promise<ArchiveLinkInterface> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!userAccess.userId || !checkUserRoles(userAccess.roles, [UserRoles.VALIDATOR])) {
      throw new UnauthorizedException("Can't get demos for validation without VALIDATOR role");
    }

    const cup: Cup | null = await this.cupRepository.createQueryBuilder('cups').where({ id: cupId }).getOne();

    if (!cup) {
      throw new NotFoundException(`Cup with id = ${cupId} not found`);
    }

    if (moment().isBefore(moment(cup.end_datetime))) {
      throw new BadRequestException(`Can't get validation archive - cup has not finished yet`);
    }

    if (cup.validation_archive_link) {
      return {
        filename: cup.validation_archive_link,
      };
    }

    const vq3Table: ResultsTableInterface = await this.tablesService.getOfflineCupTable(cup, Physics.VQ3);
    const cpmTable: ResultsTableInterface = await this.tablesService.getOfflineCupTable(cup, Physics.CPM);
    const cupName: string = cup.full_name.replace(/#/g, '').replace(/\s/g, '_');
    const validationArchiveFileName = `${cupName}_all_demos_validation.zip`;
    const validationArchiveFilePath =
      process.env.DFCOMPS_FILES_ABSOLUTE_PATH + `/demos/cup${cupId}/${validationArchiveFileName}`;

    if (fs.existsSync(validationArchiveFilePath)) {
      fs.rmSync(validationArchiveFilePath);
    }

    const writeStream = fs.createWriteStream(validationArchiveFilePath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.pipe(writeStream);

    const allCupDemos: CupDemo[] = await this.cupDemosRepository
      .createQueryBuilder('cups_demos')
      .where('cups_demos.cupId = :cupId', { cupId })
      .getMany();

    allCupDemos.forEach((demo: CupDemo) => {
      const demoPath = path.join(process.env.DFCOMPS_FILES_ABSOLUTE_PATH!, `demos/cup${cupId}/${demo.demopath}`);
      let folder: string;

      if (vq3Table.valid.some((vq3Demo: ValidDemoInterface) => vq3Demo.demopath === demo.demopath)) {
        folder = 'vq3';
      } else if (cpmTable.valid.some((cpmDemo: ValidDemoInterface) => cpmDemo.demopath === demo.demopath)) {
        folder = 'cpm';
      } else {
        folder = 'bonus';
      }

      archive.file(demoPath, { name: path.join(folder, path.basename(demo.demopath)) });
    });

    await archive.finalize();

    await this.cupRepository
      .createQueryBuilder()
      .update(Cup)
      .set({ validation_archive_link: validationArchiveFileName })
      .where({ id: cupId })
      .execute();

    return {
      filename: validationArchiveFileName,
    };
  }

  public async getStreamersArchiveLink(accessToken: string | undefined, cupId: number): Promise<ArchiveLinkInterface> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);
    const MAX_DEMOS_FOR_PHYSICS = 1000;

    if (!userAccess.userId || !checkUserRoles(userAccess.roles, [UserRoles.STREAMER])) {
      throw new UnauthorizedException("Can't get demos for streamers without STREAMER role");
    }

    const cup: Cup | null = await this.cupRepository.createQueryBuilder('cups').where({ id: cupId }).getOne();

    if (!cup) {
      throw new NotFoundException(`Cup with id = ${cupId} not found`);
    }

    if (moment().isBefore(moment(cup.end_datetime))) {
      throw new BadRequestException(`Can't get streamers archive - cup has not finished yet`);
    }

    if (cup.streamers_archive_link) {
      return {
        filename: cup.streamers_archive_link,
      };
    }

    const vq3Table: ResultsTableInterface = await this.tablesService.getOfflineCupTable(cup, Physics.VQ3);
    const cpmTable: ResultsTableInterface = await this.tablesService.getOfflineCupTable(cup, Physics.CPM);
    const cupName: string = cup.full_name.replace(/#/g, '').replace(/\s/g, '_');
    const streamersArchiveFileName = `${cupName}_streamers_demos_${v4().substring(0, 12)}.zip`;
    const streamersArchiveFilePath =
      process.env.DFCOMPS_FILES_ABSOLUTE_PATH + `/demos/cup${cupId}/${streamersArchiveFileName}`;

    if (fs.existsSync(streamersArchiveFilePath)) {
      fs.rmSync(streamersArchiveFilePath);
    }

    const writeStream = fs.createWriteStream(streamersArchiveFilePath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.pipe(writeStream);

    let cpmDemosCount = 0;
    let vq3DemosCount = 0;

    for (
      let vq3DemoIndex = 0;
      vq3DemoIndex < vq3Table.valid.length && vq3DemoIndex < MAX_DEMOS_FOR_PHYSICS;
      vq3DemoIndex++
    ) {
      archive.file(
        path.join(
          process.env.DFCOMPS_FILES_ABSOLUTE_PATH!,
          `demos/cup${cupId}/${vq3Table.valid[vq3DemoIndex].demopath}`,
        ),
        { name: path.join('vq3', this.formatNumberWithLeadingZeroes(vq3DemoIndex + 1) + '.dm_68') },
      );
      vq3DemosCount++;
    }

    for (
      let cpmDemoIndex = 0;
      cpmDemoIndex < cpmTable.valid.length && cpmDemoIndex < MAX_DEMOS_FOR_PHYSICS;
      cpmDemoIndex++
    ) {
      archive.file(
        path.join(
          process.env.DFCOMPS_FILES_ABSOLUTE_PATH!,
          `demos/cup${cupId}/${cpmTable.valid[cpmDemoIndex].demopath}`,
        ),
        { name: path.join('cpm', this.formatNumberWithLeadingZeroes(cpmDemoIndex + 1) + '.dm_68') },
      );
      cpmDemosCount++;
    }

    await archive.finalize();

    await this.cupRepository
      .createQueryBuilder()
      .update(Cup)
      .set({ streamers_archive_link: streamersArchiveFileName })
      .where({ id: cupId })
      .execute();

    return {
      filename: streamersArchiveFileName,
    };
  }

  public async registerForOnlineCup(accessToken: string | undefined, cupId: number): Promise<void> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!userAccess.userId) {
      throw new UnauthorizedException(`Can't register for online cup as unauthorized user`);
    }

    const cup: Cup | null = await this.cupRepository.createQueryBuilder('cups').where({ id: cupId }).getOne();

    if (!cup) {
      throw new BadRequestException(`Cup with id = ${cupId} not found!`);
    }

    if (cup.current_round === 6) {
      throw new BadRequestException(`Cup already ended`);
    }

    const cupResults: CupResult[] = await this.cupResultRepository
      .createQueryBuilder('cups_results')
      .where({ cup: { id: cupId } })
      .getMany();

    if (cupResults.length >= 40) {
      throw new BadRequestException(`Max players limit exceeded`);
    }

    const playerOnlineCupEntry: CupResult | null = await this.cupResultRepository
      .createQueryBuilder('cups_results')
      .where({ cup: { id: cupId } })
      .andWhere({ user: { id: userAccess.userId } })
      .getOne();

    if (playerOnlineCupEntry) {
      throw new BadRequestException(`Already registered`);
    }

    const playersServers: number[] = cupResults.map(({ server }: CupResult) => server);
    let firstServerCount = 0;
    let secondServerCount = 0;

    playersServers.forEach((server) => (server === 1 ? firstServerCount++ : secondServerCount++));

    const targetServer: number = firstServerCount > secondServerCount ? 2 : 1;

    await this.cupResultRepository
      .createQueryBuilder('cups_results')
      .insert()
      .into(CupResult)
      .values([
        {
          cup: { id: cupId },
          user: { id: userAccess.userId },
          server: targetServer,
        },
      ])
      .execute();
  }

  public async cancelRegistrationForOnlineCup(accessToken: string | undefined, cupId: number): Promise<void> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!userAccess.userId) {
      throw new UnauthorizedException(`Can't cancel registration for online cup as unauthorized user`);
    }

    const playerResults: CupResult | null = await this.cupResultRepository
      .createQueryBuilder('cups_results')
      .where({ user: { id: userAccess.userId } })
      .andWhere({ cup: { id: cupId } })
      .getOne();

    if (!playerResults) {
      throw new BadRequestException(`Can't cancel registration for online cup - user was not registered`);
    }

    const hasAtLeastOneResult: boolean =
      !!playerResults.time1 ||
      !!playerResults.time2 ||
      !!playerResults.time3 ||
      !!playerResults.time4 ||
      !!playerResults.time5;

    if (hasAtLeastOneResult) {
      throw new BadRequestException(`Can't cancel registration after scoring at least one result`);
    }

    await this.cupResultRepository
      .createQueryBuilder('cups_results')
      .delete()
      .from(CupResult)
      .where({ cup: { id: cupId } })
      .andWhere({ user: { id: userAccess.userId } })
      .execute();
  }

  public async getOnlineCupInfo(uuid: string): Promise<OnlineCupInfoInterface> {
    const cup: Cup | null = await this.cupRepository
      .createQueryBuilder('cups')
      .where({ timerId: uuid })
      .andWhere({ type: CupTypes.ONLINE })
      .getOne();

    if (!cup) {
      throw new NotFoundException(`Online cup with uuid = ${uuid} not found`);
    }

    if (!cup.map1 || !cup.map2 || !cup.map3 || !cup.map4 || !cup.map5) {
      throw new NotImplementedException(`Online cup with uuid = ${uuid} has no maps yet`);
    }

    const cups: Cup[] = await this.cupRepository
      .createQueryBuilder('cups')
      .where({ type: CupTypes.ONLINE })
      .orderBy('id', 'ASC')
      .getMany();

    return {
      fullName: cup.full_name,
      shortName: cup.short_name,
      maps: [cup.map1, cup.map2, cup.map3, cup.map4, cup.map5],
      roundDuration: 30,
    };
  }

  public async suggestMap(accessToken: string | undefined, mapName: string): Promise<void> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!userAccess.userId) {
      throw new UnauthorizedException(`Can't suggest map as unauthorized user`);
    }

    const user: User = (await this.userRepository
      .createQueryBuilder('users')
      .where({ id: userAccess.userId })
      .getOne())!;

    const lastMapSuggestionTime: string | null = user.last_map_suggestion_time;

    if (
      lastMapSuggestionTime &&
      moment(getNextWarcupTime()).subtract(1, 'week').isBefore(moment(lastMapSuggestionTime))
    ) {
      throw new BadRequestException(`You already suggested a map this week`);
    }

    const normalizedMapname = mapName.trim().toLowerCase();

    if (!normalizedMapname) {
      throw new BadRequestException(`Empty map name`);
    }

    const dfcompsCupWithSuggestedMap: Cup | null = await this.cupRepository
      .createQueryBuilder('cups')
      .where(
        `map1 = '${normalizedMapname}' OR map2 = '${normalizedMapname}' OR map3 = '${normalizedMapname}' OR map4 = '${normalizedMapname}' OR map5 = '${normalizedMapname}'`,
      )
      .getOne();

    if (dfcompsCupWithSuggestedMap) {
      throw new BadRequestException(
        `Map ${normalizedMapname} was already played (cup ${dfcompsCupWithSuggestedMap.full_name})`,
      );
    }

    const oldWarcup = OLD_WARCUP_MAPS.find(({ name }) => name.toLowerCase() === normalizedMapname);

    if (oldWarcup) {
      throw new BadRequestException(`Map ${normalizedMapname} was already played (cup Warcup #${oldWarcup.number})`);
    }

    let parsedMapInfo: ParsedMapInfoInterface;

    try {
      parsedMapInfo = await this.mapParsingService.getParsedMapInfo(normalizedMapname);
    } catch (e) {
      throw new NotFoundException(`Map ${normalizedMapname} was not found on ws.q3df.org`);
    }

    const alreadySuggestedMap: MapSuggestion | null = await this.mapSuggestionRepository
      .createQueryBuilder('map_suggestions')
      .where({ map_name: normalizedMapname })
      .getOne();

    if (alreadySuggestedMap) {
      await this.mapSuggestionRepository
        .createQueryBuilder('map_suggestions')
        .update(MapSuggestion)
        .set({ suggestions_count: alreadySuggestedMap.suggestions_count + 1 })
        .where({ map_name: normalizedMapname })
        .execute();
    } else {
      const weaponsString = mapWeaponsToString(parsedMapInfo.weapons);

      this.levelshotsService.downloadLevelshot(normalizedMapname);

      await this.mapSuggestionRepository
        .createQueryBuilder('map_suggestions')
        .insert()
        .into(MapSuggestion)
        .values([
          {
            map_name: normalizedMapname,
            suggestions_count: 1,
            author: parsedMapInfo.author,
            weapons: weaponsString,
            is_admin_suggestion: false,
            size: parsedMapInfo.size,
            map_type: weaponsString.includes('U') ? MapType.STRAFE : MapType.WEAPON,
            pk3_link: parsedMapInfo.pk3,
            is_blacklisted: false,
            user: {
              id: userAccess.userId!,
            },
          },
        ])
        .execute();
    }

    if (!checkUserRoles(userAccess.roles, [UserRoles.WARCUP_ADMIN])) {
      await this.userRepository
        .createQueryBuilder('users')
        .update(User)
        .set({
          last_map_suggestion_time: moment().format(),
        })
        .where({ id: userAccess.userId })
        .execute();
    }
  }

  public async checkPreviousCups(accessToken: string | undefined, mapName: string): Promise<CheckPreviousCupsType> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!userAccess.userId) {
      throw new UnauthorizedException(`Can't check previous cups as unauthorized user`);
    }

    const normalizedMapname = mapName.trim().toLowerCase();

    if (!normalizedMapname) {
      throw new BadRequestException('Empty mapname');
    }

    let oldCompetitionName: string | null = null;
    const cupWithSuggestedMap: Cup | null = await this.cupRepository
      .createQueryBuilder('cups')
      .where(
        `map1 = '${normalizedMapname}' OR map2 = '${normalizedMapname}' OR map3 = '${normalizedMapname}' OR map4 = '${normalizedMapname}' OR map5 = '${normalizedMapname}'`,
      )
      .getOne();

    if (cupWithSuggestedMap) {
      oldCompetitionName = cupWithSuggestedMap.full_name;
    }

    const oldWarcup = OLD_WARCUP_MAPS.find(({ name }) => name.toLowerCase() === normalizedMapname);

    if (oldWarcup) {
      oldCompetitionName = `Warcup #${oldWarcup.number}`;
    }

    if (oldCompetitionName) {
      return {
        wasOnCompetition: true,
        lastCompetition: oldCompetitionName,
      };
    } else {
      return {
        wasOnCompetition: false,
        lastCompetition: null,
      };
    }
  }

  public async getParsedMapInfo(accessToken: string | undefined, map: string): Promise<ParsedMapInfoInterface> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!userAccess.userId) {
      throw new UnauthorizedException(`Unauthorized users can't get parsed map info`);
    }

    return await this.mapParsingService.getParsedMapInfo(map);
  }

  public async reviewMap(accessToken: string | undefined, cupId: number, vote: number): Promise<MapRatingInterface> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!userAccess.userId) {
      throw new UnauthorizedException("Unauthorized users can't vote for map rating");
    }

    const cup: Cup | null = await this.cupRepository.createQueryBuilder('cups').where({ id: cupId }).getOne();

    if (!cup) {
      throw new NotFoundException(`Cup with id = ${cupId} not found`);
    }

    if (![1, 2, 3, 4, 5].includes(vote)) {
      throw new BadRequestException(`Wrong value for vote, should be in [1, 2, 3, 4, 5]`);
    }

    const previousCupReview: CupReview | null = await this.cupReviewRepository
      .createQueryBuilder('cups_reviews')
      .where({ user: { id: userAccess.userId } })
      .andWhere({ cup: { id: cupId } })
      .getOne();

    if (previousCupReview) {
      throw new BadRequestException(`Can't vote for map rating twice`);
    }

    const isFinishedCup: boolean = moment().isAfter(moment(cup.end_datetime));

    if (!isFinishedCup) {
      throw new BadRequestException(`Map rating voting is unavailable - cup is not finished`);
    }

    const isAfterTwoWeeks: boolean = moment().isAfter(moment(cup.end_datetime).add(2, 'weeks'));

    if (isAfterTwoWeeks) {
      throw new BadRequestException(`Map rating voting is unavailable - two weeks passed since cup finish time`);
    }

    const cupDemoForUser: CupDemo | null = await this.cupDemosRepository
      .createQueryBuilder('cups_demos')
      .where({ user: { id: userAccess.userId } })
      .andWhere({ cup: { id: cupId } })
      .getOne();

    const isCupParticipant = !!cupDemoForUser;
    const currentMapRating = cup.map_rating || 0;
    const currentInternalVoteCount = cup.internal_vote_count || 0;
    const numberOfVotesForCurrentUser = isCupParticipant ? 2 : 1;
    const resultingInternalVoteCount = currentInternalVoteCount + numberOfVotesForCurrentUser;
    const resultingDisplayVoteCount = (cup.display_vote_count || 0) + 1;
    const resultingMapRating =
      (currentMapRating * currentInternalVoteCount + vote * numberOfVotesForCurrentUser) / resultingInternalVoteCount;

    await this.cupRepository
      .createQueryBuilder('cups')
      .update(Cup)
      .set({
        map_rating: Number(resultingMapRating.toFixed(5)),
        internal_vote_count: resultingInternalVoteCount,
        display_vote_count: resultingDisplayVoteCount,
      })
      .where({ id: cupId })
      .execute();

    await this.cupReviewRepository
      .createQueryBuilder()
      .insert()
      .into(CupReview)
      .values([
        {
          user: { id: userAccess.userId },
          cup: { id: cupId },
          vote,
        },
      ])
      .execute();

    return {
      mapRating: Number(resultingMapRating.toFixed(2)),
    };
  }

  private formatNumberWithLeadingZeroes(n: number): string {
    if (n < 10) {
      return `000${n}`;
    }

    if (n < 100) {
      return `00${n}`;
    }

    if (n < 1000) {
      return `0${n}`;
    }

    return `${n}`;
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
