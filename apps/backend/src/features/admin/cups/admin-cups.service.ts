import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  NotImplementedException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../../auth/auth.service';
import {
  AddOfflineCupDto,
  AdminActiveCupInterface,
  AdminActiveMulticupInterface,
  AdminCupInterface,
  AdminEditCupInterface,
  AdminPlayerDemosValidationInterface,
  AdminValidationInterface,
  CupTypes,
  MulticupResultInterface,
  MulticupTableInterface,
  NewsTypes,
  OnlineCupActionDto,
  OnlineCupPlayersInterface,
  OnlineCupServersPlayersInterface,
  ParsedOnlineCupRoundInterface,
  Physics,
  ProcessValidationDto,
  ResultsTableInterface,
  RoundResultEntryInterface,
  UpdateOfflineCupDto,
  UploadedFileLinkInterface,
  ValidDemoInterface,
  ValidationResultInterface,
  VerifiedStatuses,
  WorldspawnMapInfoInterface,
} from '@dfcomps/contracts';
import { InjectRepository } from '@nestjs/typeorm';
import { Cup } from '../../../shared/entities/cup.entity';
import { DeepPartial, InsertResult, Repository } from 'typeorm';
import { getHumanTime } from '../../../shared/helpers/get-human-time';
import { UserAccessInterface } from '../../../shared/interfaces/user-access.interface';
import { UserRoles, checkUserRoles, isSuperadmin } from '@dfcomps/auth';
import * as moment from 'moment-timezone';
import { CupDemo } from '../../../shared/entities/cup-demo.entity';
import { TablesService } from '../../tables/tables.service';
import { User } from '../../../shared/entities/user.entity';
import { TableEntryWithRatingInterface } from './table-entry-with-rating.interface';
import { RatingChange } from '../../../shared/entities/rating-change.entity';
import { Season } from '../../../shared/entities/season.entity';
import * as Zip from 'adm-zip';
import * as fs from 'fs';
import { Multicup } from '../../../shared/entities/multicup.entity';
import axios from 'axios';
import { getMapLevelshot } from '../../../shared/helpers/get-map-levelshot';
import { v4 } from 'uuid';
import { News } from '../../../shared/entities/news.entity';
import { mapNewsTypeEnumToDBNewsTypeId } from 'apps/backend/src/shared/mappers/news-types.mapper';
import * as sharp from 'sharp';
import { Metadata, Sharp } from 'sharp';
import { NewsComment } from 'apps/backend/src/shared/entities/news-comment.entity';
import { CupResult } from 'apps/backend/src/shared/entities/cup-result.entity';
import { MulterFileInterface } from 'apps/backend/src/shared/interfaces/multer.interface';
import { Unpacked } from '@dfcomps/helpers';
import { distance, closest } from 'fastest-levenshtein';

// TODO Split offline and online cups
@Injectable()
export class AdminCupsService {
  constructor(
    private readonly authService: AuthService,
    private readonly tablesService: TablesService,
    @InjectRepository(Cup) private readonly cupsRepository: Repository<Cup>,
    @InjectRepository(News) private readonly newsRepository: Repository<News>,
    @InjectRepository(NewsComment) private readonly newsCommentsRepository: Repository<NewsComment>,
    @InjectRepository(Multicup) private readonly multicupsRepository: Repository<Multicup>,
    @InjectRepository(CupDemo) private readonly cupsDemosRepository: Repository<CupDemo>,
    @InjectRepository(CupResult) private readonly cupsResultsRepository: Repository<CupResult>,
    @InjectRepository(Season) private readonly seasonRepository: Repository<Season>,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(RatingChange) private readonly ratingChangesRepository: Repository<RatingChange>,
  ) {}

  public async getAllCups(accessToken: string | undefined): Promise<AdminCupInterface[]> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!checkUserRoles(userAccess.roles, [UserRoles.CUP_ORGANIZER, UserRoles.VALIDATOR])) {
      throw new UnauthorizedException('Unauthorized to get admin cups list without CUP_ORGANIZER role');
    }

    const cups: Cup[] = await this.cupsRepository.createQueryBuilder('cups').orderBy('id', 'DESC').getMany();

    return cups.map((cup: Cup) => ({
      id: cup.id,
      fullName: cup.full_name,
      duration: getHumanTime(cup.start_datetime) + ' - ' + getHumanTime(cup.end_datetime),
      physics: cup.physics,
      type: cup.type,
      validationAvailable:
        cup.rating_calculated === false &&
        cup.type === CupTypes.OFFLINE &&
        checkUserRoles(userAccess.roles, [UserRoles.VALIDATOR]) &&
        (moment().isAfter(moment(cup.end_datetime)) || isSuperadmin(userAccess.roles)),
      calculateRatingsAvailable: cup.rating_calculated === false && cup.demos_validated === true,
      endDateTime: cup.end_datetime,
      hasTwoServers: cup.use_two_servers,
      isFinishAvailable: cup.current_round === 6,
    }));
  }

  public async getSingleCup(accessToken: string | undefined, cupId: number): Promise<AdminEditCupInterface> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!checkUserRoles(userAccess.roles, [UserRoles.CUP_ORGANIZER])) {
      throw new UnauthorizedException('Unauthorized to get admin cup info without CUP_ORGANIZER role');
    }

    const cup: Cup | null = await this.cupsRepository
      .createQueryBuilder('cups')
      .leftJoinAndSelect('cups.multicup', 'multicups')
      .leftJoinAndSelect('cups.news', 'news')
      .where({ id: cupId })
      .getOne();

    if (!cup) {
      throw new NotFoundException(`Cup with id = ${cupId} not found`);
    }

    return {
      id: cup.id,
      fullName: cup.full_name,
      shortName: cup.short_name,
      startTime: cup.start_datetime,
      endTime: cup.end_datetime,
      mapType: cup.map_pk3.match(/ws.q3df.org/) ? 'ws' : 'custom',
      mapName: cup.map1!,
      mapPk3: cup.map_pk3,
      mapLevelshot: getMapLevelshot(cup.map1!),
      author: cup.map_author,
      weapons: cup.map_weapons,
      multicupId: cup.multicup?.id || null,
      addNews: cup.news.length === 2,
      size: cup.map_size,
      useTwoServers: cup.use_two_servers,
      server1: cup.server1,
      server2: cup.server2,
      physics: cup.physics,
      maps: [cup.map1, cup.map2, cup.map3, cup.map4, cup.map5],
    };
  }

  public async addOfflineCup(accessToken: string | undefined, addOfflineCupDto: AddOfflineCupDto): Promise<void> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!checkUserRoles(userAccess.roles, [UserRoles.CUP_ORGANIZER])) {
      throw new UnauthorizedException('Unauthorized to add cup without CUP_ORGANIZER role');
    }

    const startDatetime = moment(addOfflineCupDto.startTime).tz('Europe/Moscow').format();
    const endDatetime = moment(addOfflineCupDto.endTime).tz('Europe/Moscow').format();

    const queryResult: InsertResult = await this.cupsRepository
      .createQueryBuilder()
      .insert()
      .into(Cup)
      .values([
        {
          full_name: addOfflineCupDto.fullName,
          short_name: addOfflineCupDto.shortName,
          youtube: null,
          twitch: null,
          current_round: 1,
          start_datetime: startDatetime,
          end_datetime: endDatetime,
          server1: '',
          server2: '',
          map1: addOfflineCupDto.mapName,
          map2: null,
          map3: null,
          map4: null,
          map5: null,
          physics: 'mixed',
          type: CupTypes.OFFLINE,
          map_weapons: addOfflineCupDto.weapons,
          map_author: addOfflineCupDto.mapAuthor,
          map_pk3: addOfflineCupDto.mapPk3Link,
          map_size: addOfflineCupDto.size,
          archive_link: null,
          bonus_rating: 0,
          system: null,
          custom_map: addOfflineCupDto.mapPk3Link,
          custom_news: null,
          validation_archive_link: null,
          timer: false,
          rating_calculated: false,
          use_two_servers: false,
          demos_validated: false,
          multicup: addOfflineCupDto.multicupId ? { id: addOfflineCupDto.multicupId } : null,
        },
      ])
      .execute();

    if (addOfflineCupDto.addNews) {
      const cupId: number = queryResult.identifiers[0].id;

      await this.newsRepository
        .createQueryBuilder()
        .insert()
        .into(News)
        .values([
          {
            header: `Старт ${addOfflineCupDto.fullName}!`,
            header_en: `${addOfflineCupDto.fullName} start!`,
            text: '',
            text_en: '',
            youtube: null,
            user: { id: userAccess.userId! },
            datetimezone: startDatetime,
            newsType: { id: mapNewsTypeEnumToDBNewsTypeId(NewsTypes.OFFLINE_START) },
            cup: { id: cupId },
            comments_count: 0,
            hide_on_main: false,
          },
        ])
        .execute();

      await this.newsRepository
        .createQueryBuilder()
        .insert()
        .into(News)
        .values([
          {
            header: `Результаты ${addOfflineCupDto.fullName}`,
            header_en: `Results: ${addOfflineCupDto.fullName}`,
            text: '',
            text_en: '',
            youtube: null,
            user: { id: userAccess.userId! },
            datetimezone: endDatetime,
            newsType: { id: mapNewsTypeEnumToDBNewsTypeId(NewsTypes.OFFLINE_RESULTS) },
            cup: { id: cupId },
            comments_count: 0,
            hide_on_main: false,
          },
        ])
        .execute();
    }
  }

  public async updateOfflineCup(
    accessToken: string | undefined,
    updateOfflineCupDto: UpdateOfflineCupDto,
    cupId: number,
  ): Promise<void> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!checkUserRoles(userAccess.roles, [UserRoles.CUP_ORGANIZER])) {
      throw new UnauthorizedException('Unauthorized to edit cup without CUP_ORGANIZER role');
    }

    const cup: Cup | null = await this.cupsRepository.createQueryBuilder('cups').where({ id: cupId }).getOne();

    if (!cup) {
      throw new NotFoundException(`Cup with id = ${cupId} not found`);
    }

    if (moment().isAfter(moment(cup.end_datetime))) {
      throw new BadRequestException(`Can't update - cup already finished`);
    }

    const startDatetime = moment(updateOfflineCupDto.startTime).tz('Europe/Moscow').format();
    const endDatetime = moment(updateOfflineCupDto.endTime).tz('Europe/Moscow').format();

    if (updateOfflineCupDto.mapPk3Link) {
      const absolutePk3Link = process.env.DFCOMPS_FILES_ABSOLUTE_PATH + updateOfflineCupDto.mapPk3Link;

      if (fs.existsSync(absolutePk3Link)) {
        fs.rmSync(absolutePk3Link);
      }
    }

    await this.cupsRepository
      .createQueryBuilder()
      .update(Cup)
      .set({
        full_name: updateOfflineCupDto.fullName,
        short_name: updateOfflineCupDto.shortName,
        start_datetime: startDatetime,
        end_datetime: endDatetime,
        map1: updateOfflineCupDto.mapName,
        map_weapons: updateOfflineCupDto.weapons,
        map_author: updateOfflineCupDto.mapAuthor,
        map_pk3: updateOfflineCupDto.mapPk3Link || undefined,
        map_size: updateOfflineCupDto.size,
        multicup: updateOfflineCupDto.multicupId ? { id: updateOfflineCupDto.multicupId } : undefined,
      })
      .where({ id: cupId })
      .execute();

    if (updateOfflineCupDto.addNews) {
      await this.newsRepository
        .createQueryBuilder('news')
        .update(News)
        .set({
          header: `Старт ${updateOfflineCupDto.fullName}!`,
          header_en: `${updateOfflineCupDto.fullName} start!`,
          user: { id: userAccess.userId! },
          datetimezone: startDatetime,
        })
        .where({ cup: { id: cupId } })
        .andWhere({ newsType: { id: mapNewsTypeEnumToDBNewsTypeId(NewsTypes.OFFLINE_START) } })
        .execute();

      await this.newsRepository
        .createQueryBuilder('news')
        .update(News)
        .set({
          header: `Результаты ${updateOfflineCupDto.fullName}`,
          header_en: `Results: ${updateOfflineCupDto.fullName}`,
          user: { id: userAccess.userId! },
          datetimezone: endDatetime,
        })
        .where({ cup: { id: cupId } })
        .andWhere({ newsType: { id: mapNewsTypeEnumToDBNewsTypeId(NewsTypes.OFFLINE_RESULTS) } })
        .execute();
    }
  }

  public async deleteCup(accessToken: string | undefined, cupId: number): Promise<void> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!checkUserRoles(userAccess.roles, [UserRoles.CUP_ORGANIZER])) {
      throw new UnauthorizedException('Unauthorized to delete cup without CUP_ORGANIZER role');
    }

    const cup: Cup | null = await this.cupsRepository.createQueryBuilder('cups').where({ id: cupId }).getOne();

    if (!cup) {
      throw new NotFoundException(`Cup with id = ${cupId} not found`);
    }

    if (moment().isAfter(moment(cup.end_datetime))) {
      throw new BadRequestException(`Can't delete - cup already finished`);
    }

    const newsIds: number[] = (
      await this.newsRepository
        .createQueryBuilder()
        .where({ cup: { id: cupId } })
        .getMany()
    ).map((newsItem: News) => newsItem.id);

    if (newsIds.length) {
      await this.newsCommentsRepository
        .createQueryBuilder('news_comments')
        .delete()
        .from(NewsComment)
        .where('"news_comments"."newsId" IN(:...ids)', { ids: newsIds })
        .execute();
    }

    await this.newsRepository
      .createQueryBuilder()
      .delete()
      .from(News)
      .where({ cup: { id: cupId } })
      .execute();

    await this.cupsDemosRepository
      .createQueryBuilder()
      .delete()
      .from(CupDemo)
      .where({ cup: { id: cupId } })
      .execute();

    await this.cupsResultsRepository
      .createQueryBuilder()
      .delete()
      .from(CupResult)
      .where({ cup: { id: cupId } })
      .execute();

    await this.cupsRepository.createQueryBuilder().delete().from(Cup).where({ id: cupId }).execute();
  }

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

  public async processValidation(
    accessToken: string | undefined,
    { validationResults, allDemosCount }: ProcessValidationDto,
    cupId: number,
  ): Promise<void> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!checkUserRoles(userAccess.roles, [UserRoles.VALIDATOR])) {
      throw new UnauthorizedException('Unauthorized to set validation results, VALIDATOR role needed');
    }

    const cup: Cup | null = await this.cupsRepository.createQueryBuilder('cups').where({ id: cupId }).getOne();

    if (!cup) {
      throw new NotFoundException(`Cup with id = ${cupId} not found`);
    }

    const targetEntries: Partial<CupDemo>[] = validationResults.map(
      ({ id, validationStatus, reason, isOrganizer, isOutsideCompetition }: ValidationResultInterface) => ({
        id,
        reason,
        verified_status: validationStatus,
        isOrganizer,
        isOutsideCompetition,
      }),
    );

    await this.cupsDemosRepository.save(targetEntries);

    if (moment().isAfter(moment(cup.end_datetime)) && targetEntries.length === allDemosCount) {
      await this.cupsRepository
        .createQueryBuilder()
        .update(Cup)
        .set({ demos_validated: true, validator_id: userAccess.userId })
        .where({ id: cupId })
        .execute();
    }
  }

  public async calculateOfflineCupRating(accessToken: string | undefined, cupId: number): Promise<void> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!checkUserRoles(userAccess.roles, [UserRoles.VALIDATOR])) {
      throw new UnauthorizedException('Unauthorized to calculate rating, VALIDATOR role needed');
    }

    const cup: Cup | null = await this.cupsRepository.createQueryBuilder('cups').where({ id: cupId }).getOne();

    if (!cup) {
      throw new NotFoundException(`No cup with cup id = ${cupId}`);
    }

    if (cup.rating_calculated) {
      throw new BadRequestException('Rating was already calculated');
    }

    if (!cup.demos_validated) {
      throw new BadRequestException("Can't calculate rating - demos are not validated yet");
    }

    if (cup.type !== CupTypes.OFFLINE) {
      throw new BadRequestException('Wrong cup type, this endpoint only works for offline cups');
    }

    this.calculateOfflineRating(cup, Physics.VQ3);
    this.calculateOfflineRating(cup, Physics.CPM);

    await this.cupsRepository
      .createQueryBuilder()
      .update(Cup)
      .set({ rating_calculated: true })
      .where({ id: cupId })
      .execute();
  }

  public async finishOfflineCup(accessToken: string | undefined, cupId: number): Promise<void> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!checkUserRoles(userAccess.roles, [UserRoles.VALIDATOR])) {
      throw new UnauthorizedException('Unauthorized to finish cup, VALIDATOR role needed');
    }

    const cup: Cup | null = await this.cupsRepository.createQueryBuilder('cups').where({ id: cupId }).getOne();

    if (!cup) {
      throw new NotFoundException(`No cup with cup id = ${cupId}`);
    }

    if (!cup.rating_calculated) {
      throw new BadRequestException("Can't finish cup - rating was not calculated yet");
    }

    if (!cup.demos_validated) {
      throw new BadRequestException("Can't finish cup - demos are not validated yet");
    }

    const vq3Table: ResultsTableInterface = await this.tablesService.getOfflineCupTable(cup, Physics.VQ3);
    const cpmTable: ResultsTableInterface = await this.tablesService.getOfflineCupTable(cup, Physics.CPM);
    const cupName: string = cup.full_name.replace(/#/g, '').replace(/\s/g, '_');
    const zip = new Zip();
    const archiveFileName = `${cupName}_all_demos.zip`;
    const relativeArchiveFilePath = process.env.DFCOMPS_FILES_RELATIVE_PATH + `/demos/cup${cupId}/${archiveFileName}`;
    const archiveFilePath = process.env.DFCOMPS_FILES_ABSOLUTE_PATH + `/demos/cup${cupId}/${archiveFileName}`;

    if (fs.existsSync(archiveFilePath)) {
      fs.rmSync(archiveFilePath);
    }

    vq3Table.valid.forEach((demo: ValidDemoInterface) => {
      zip.addLocalFile(process.env.DFCOMPS_FILES_ABSOLUTE_PATH + `/demos/cup${cupId}/${demo.demopath}`, 'vq3');
    });

    cpmTable.valid.forEach((demo: ValidDemoInterface) => {
      zip.addLocalFile(process.env.DFCOMPS_FILES_ABSOLUTE_PATH + `/demos/cup${cupId}/${demo.demopath}`, 'cpm');
    });

    zip.writeZip(archiveFilePath);

    const allValidDemos: CupDemo[] = await this.cupsDemosRepository
      .createQueryBuilder('cups_demos')
      .where('cups_demos.cupId = :cupId', { cupId })
      .andWhere({ verified_status: VerifiedStatuses.VALID })
      .getMany();

    allValidDemos.forEach(({ demopath }: CupDemo) => {
      const fileName = process.env.DFCOMPS_FILES_ABSOLUTE_PATH + `/demos/cup${cupId}/${demopath}`;

      if (fs.existsSync(fileName)) {
        fs.rmSync(fileName);
      }
    });

    const cupValidationArchiveFileName =
      process.env.DFCOMPS_FILES_ABSOLUTE_PATH + `/demos/cup${cupId}/${cup.validation_archive_link}`;

    if (fs.existsSync(cupValidationArchiveFileName)) {
      fs.rmSync(cupValidationArchiveFileName);
    }

    await this.cupsRepository
      .createQueryBuilder()
      .update(Cup)
      .set({ archive_link: relativeArchiveFilePath })
      .where({ id: cupId })
      .execute();
  }

  public async getAllActiveMulticups(accessToken: string | undefined): Promise<AdminActiveMulticupInterface[]> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!checkUserRoles(userAccess.roles, [UserRoles.CUP_ORGANIZER])) {
      throw new UnauthorizedException('Unauthorized to get all active multicups, CUP_ORGANIZER role needed');
    }

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

  public async getWorldspawnMapInfo(accessToken: string | undefined, map: string): Promise<WorldspawnMapInfoInterface> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!checkUserRoles(userAccess.roles, [UserRoles.CUP_ORGANIZER])) {
      throw new UnauthorizedException('Unauthorized to get worldspawn map info, CUP_ORGANIZER role needed');
    }

    const url = `http://ws.q3df.org/map/${map}/`;
    let mapPageHtml: string;

    try {
      mapPageHtml = (await axios.get(url)).data;
    } catch (e) {
      throw new NotFoundException(`Map ${map} was not found on worldspawn`);
    }

    if (mapPageHtml.includes('A server error occured. Please try again later.')) {
      throw new NotFoundException(`Map ${map} was not found on worldspawn`);
    }

    const weaponsRegex = /\<td\>Weapons\<\/td\>((.*\n)*?)(.*?)\<\/td\>/;
    const weaponsMatches = mapPageHtml.match(weaponsRegex);
    const mapWeapons: WorldspawnMapInfoInterface['weapons'] = {
      grenade: false,
      rocket: false,
      plasma: false,
      lightning: false,
      bfg: false,
      railgun: false,
      shotgun: false,
      grapple: false,
      machinegun: false,
      gauntlet: false,
    };

    let isWeaponFound = false;

    if (weaponsMatches) {
      const weaponsHtml = weaponsMatches[0];

      const weaponsIcons: string[] = [
        'iconw_grenade',
        'iconw_rocket',
        'iconw_plasma',
        'iconw_bfg',
        'iconw_gauntlet',
        'iconw_machinegun',
        'iconw_shotgun',
        'iconw_lightning',
        'iconw_railgun',
        'iconw_grapple',
      ];

      weaponsIcons.forEach((icon: string) => {
        if (weaponsHtml.includes(icon)) {
          mapWeapons[icon.slice(6) as keyof WorldspawnMapInfoInterface['weapons']] = true;
          isWeaponFound = true;
        }
      });
    }

    if (!isWeaponFound) {
      mapWeapons.gauntlet = true;
    }

    const authorRegex = /\<td\>Author\<\/td\>((.*\n)*?)(.*?)link\"\>(.*?)\<\/a\>\<\/td\>/;
    const authorMatches = mapPageHtml.match(authorRegex);
    const pk3Regex = /\<a\shref=\"\/maps\/downloads\/(.*?)\.pk3/;
    const pk3Matches = mapPageHtml.match(pk3Regex);

    if (!pk3Matches) {
      throw new InternalServerErrorException(`Could not parse pk3 link for map ${map}`);
    }

    const sizeRegex = /\<td\>File size(.*)\n(.*)title=\"(.*?)\s/;
    const sizeMatches = mapPageHtml.match(sizeRegex);

    if (!sizeMatches) {
      throw new InternalServerErrorException(`Could not parse size for map ${map}`);
    }

    return {
      name: map,
      size: sizeMatches[3],
      author: authorMatches && authorMatches.length === 5 ? authorMatches[4] : 'Unknown',
      pk3: `https://ws.q3df.org/maps/downloads/${pk3Matches[1]}.pk3`,
      weapons: mapWeapons,
      levelshot: getMapLevelshot(map),
    };
  }

  public async uploadLevelshot(
    accessToken: string | undefined,
    levelshot: MulterFileInterface,
    mapName: string,
  ): Promise<UploadedFileLinkInterface> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!checkUserRoles(userAccess.roles, [UserRoles.CUP_ORGANIZER])) {
      throw new UnauthorizedException('Unauthorized to upload map levelshot, CUP_ORGANIZER role needed');
    }

    const image: Sharp = await sharp(levelshot.buffer);
    const metadata: Metadata = await image.metadata();
    let resultImage: Buffer;

    if (metadata.width === 512 && metadata.height === 384) {
      resultImage = levelshot.buffer;
    } else {
      resultImage = await image.resize(512, 384).jpeg().toBuffer();
    }

    const relativePath = `/images/maps/${mapName.toLowerCase()}.jpg`;
    const fullUploadPath = process.env.DFCOMPS_FILES_ABSOLUTE_PATH + relativePath;

    if (fs.existsSync(fullUploadPath)) {
      fs.rmSync(fullUploadPath);
    }

    fs.writeFileSync(fullUploadPath, resultImage);

    return {
      link: process.env.DFCOMPS_FILES_RELATIVE_PATH + relativePath,
    };
  }

  public async uploadMap(
    accessToken: string | undefined,
    map: MulterFileInterface,
    mapName: string,
  ): Promise<UploadedFileLinkInterface> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!checkUserRoles(userAccess.roles, [UserRoles.CUP_ORGANIZER])) {
      throw new UnauthorizedException('Unauthorized to upload map pk3, CUP_ORGANIZER role needed');
    }

    const uuid = v4();
    const relativePath = `/maps/${uuid}/${mapName.toLowerCase()}.pk3`;
    const fullUploadPath = process.env.DFCOMPS_FILES_ABSOLUTE_PATH + relativePath;

    fs.mkdirSync(process.env.DFCOMPS_FILES_ABSOLUTE_PATH + `/maps/${uuid}`);
    fs.writeFileSync(fullUploadPath, map.buffer);

    return {
      link: process.env.DFCOMPS_FILES_RELATIVE_PATH + relativePath,
    };
  }

  public async addOnlineCup(accessToken: string | undefined, addOnlineCupDto: OnlineCupActionDto): Promise<void> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!checkUserRoles(userAccess.roles, [UserRoles.CUP_ORGANIZER])) {
      throw new UnauthorizedException('Unauthorized to add cup without CUP_ORGANIZER role');
    }

    const startDatetime = moment(addOnlineCupDto.startTime).tz('Europe/Moscow').format();
    const endDatetime = moment(addOnlineCupDto.startTime).tz('Europe/Moscow').add(3, 'hours').format();

    await this.cupsRepository
      .createQueryBuilder()
      .insert()
      .into(Cup)
      .values([
        {
          full_name: addOnlineCupDto.fullName,
          short_name: addOnlineCupDto.shortName,
          youtube: null,
          twitch: null,
          current_round: 1,
          start_datetime: startDatetime,
          end_datetime: endDatetime,
          server1: addOnlineCupDto.server1,
          server2: addOnlineCupDto.server2,
          map1: null,
          map2: null,
          map3: null,
          map4: null,
          map5: null,
          physics: addOnlineCupDto.physics,
          type: CupTypes.ONLINE,
          map_weapons: '',
          map_author: '',
          map_pk3: '',
          map_size: '',
          archive_link: null,
          bonus_rating: 0,
          system: null,
          custom_map: null,
          custom_news: null,
          validation_archive_link: null,
          timer: false,
          rating_calculated: false,
          use_two_servers: addOnlineCupDto.useTwoServers,
          demos_validated: false,
          multicup: null,
        },
      ])
      .execute();
  }

  public async updateOnlineCup(
    accessToken: string | undefined,
    updateOnlineCupDto: OnlineCupActionDto,
    cupId: number,
  ): Promise<void> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!checkUserRoles(userAccess.roles, [UserRoles.CUP_ORGANIZER])) {
      throw new UnauthorizedException('Unauthorized to edit cup without CUP_ORGANIZER role');
    }

    const cup: Cup | null = await this.cupsRepository.createQueryBuilder('cups').where({ id: cupId }).getOne();

    if (!cup) {
      throw new NotFoundException(`Cup with id = ${cupId} not found`);
    }

    if (moment().isAfter(moment(cup.end_datetime))) {
      throw new BadRequestException(`Can't update - cup already finished`);
    }

    const startDatetime = moment(updateOnlineCupDto.startTime).tz('Europe/Moscow').format();
    const endDatetime = moment(updateOnlineCupDto.startTime).tz('Europe/Moscow').add(3, 'hours').format();

    await this.cupsRepository
      .createQueryBuilder()
      .update(Cup)
      .set({
        full_name: updateOnlineCupDto.fullName,
        short_name: updateOnlineCupDto.shortName,
        start_datetime: startDatetime,
        end_datetime: endDatetime,
        use_two_servers: updateOnlineCupDto.useTwoServers,
        server1: updateOnlineCupDto.server1,
        server2: updateOnlineCupDto.server2,
        physics: updateOnlineCupDto.physics,
      })
      .where({ id: cupId })
      .execute();
  }

  public async getAllCupsWithoutNews(
    accessToken: string | undefined,
    cupType: CupTypes,
    newsType: NewsTypes,
  ): Promise<AdminActiveCupInterface[]> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!checkUserRoles(userAccess.roles, [UserRoles.NEWSMAKER])) {
      throw new UnauthorizedException('Unauthorized to get all cups for news without NEWSMAKER role');
    }

    const cupsWithNews: Cup[] = await this.cupsRepository
      .createQueryBuilder('cups')
      .leftJoinAndSelect('cups.news', 'news')
      .leftJoinAndSelect('news.newsType', 'news_types')
      .where({ type: cupType })
      .orderBy('cups.id', 'DESC')
      .getMany();

    return cupsWithNews
      .filter((cup: Cup) => cup.news.every((newsItem: News) => newsItem.newsType.name !== newsType))
      .map((cup: Cup) => ({
        cupId: cup.id,
        name: cup.full_name,
      }));
  }

  public async getOnlineCupServersPlayers(
    accessToken: string | undefined,
    cupId: number,
  ): Promise<OnlineCupServersPlayersInterface> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!checkUserRoles(userAccess.roles, [UserRoles.CUP_ORGANIZER])) {
      throw new UnauthorizedException('Unauthorized to get online cup servers players without CUP_ORGANIZER role');
    }

    const cup: Cup | null = await this.cupsRepository.createQueryBuilder('cups').where({ id: cupId }).getOne();

    if (!cup) {
      throw new NotFoundException(`Cup with id = ${cupId} was not found`);
    }

    const serversPlayers: CupResult[] = await this.cupsResultsRepository
      .createQueryBuilder('cups_results')
      .leftJoinAndSelect('cups_results.user', 'users')
      .where({ cup: { id: cupId } })
      .getMany();

    return {
      servers: [
        {
          address: cup.server1,
          players: serversPlayers
            .filter((serversPlayers: CupResult) => serversPlayers.server === 1)
            .map((serversPlayers: CupResult) => ({
              id: serversPlayers.user.id,
              playerNick: serversPlayers.user.displayed_nick,
            })),
        },
        {
          address: cup.server2,
          players: serversPlayers
            .filter((serversPlayers: CupResult) => serversPlayers.server === 2)
            .map((serversPlayers: CupResult) => ({
              id: serversPlayers.user.id,
              playerNick: serversPlayers.user.displayed_nick,
            })),
        },
      ],
    };
  }

  public async setPlayerServer(
    accessToken: string | undefined,
    userId: number,
    onlineCupId: number,
    serverNumber: number,
  ): Promise<void> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!checkUserRoles(userAccess.roles, [UserRoles.CUP_ORGANIZER])) {
      throw new UnauthorizedException('Unauthorized to set online cup player server without CUP_ORGANIZER role');
    }

    const cup: Cup | null = await this.cupsRepository
      .createQueryBuilder('cups')
      .where({ id: onlineCupId })
      .andWhere({ type: CupTypes.ONLINE })
      .getOne();

    if (!cup) {
      throw new BadRequestException(`No online cup with id = ${onlineCupId} was found`);
    }

    const targetUser: User | null = await this.usersRepository
      .createQueryBuilder('users')
      .where({ id: userId })
      .getOne();

    if (!targetUser) {
      throw new BadRequestException(`No user with id = ${userId} was found`);
    }

    if (!cup.use_two_servers) {
      throw new BadRequestException(`Can't change player's server - online cup uses only one server`);
    }

    if (serverNumber !== 1 && serverNumber !== 2) {
      throw new BadRequestException(`Wrong server number - must be 1 or 2`);
    }

    await this.cupsResultsRepository
      .createQueryBuilder()
      .update(CupResult)
      .set({
        server: serverNumber,
      })
      .where({ user: { id: userId } })
      .andWhere({ cup: { id: onlineCupId } })
      .execute();
  }

  public async parseServerLogs(
    accessToken: string | undefined,
    serverLogs: MulterFileInterface,
    cupId: number,
  ): Promise<ParsedOnlineCupRoundInterface> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!checkUserRoles(userAccess.roles, [UserRoles.CUP_ORGANIZER])) {
      throw new UnauthorizedException('Unauthorized to parse server logs without CUP_ORGANIZER role');
    }

    // R_Init position is used to determine map change on server
    const stringLogFile: string[] = serverLogs.buffer.toString('utf8').split('----- R_Init -----');

    const logLines: string[] = stringLogFile[stringLogFile.length - 1]
      .split('\n')
      // fast filtering non-time messages
      .filter((line: string) => line.includes('reached the finish line in'))
      // filtering console abuse with text messages with times from players
      .filter((line: string) => !line.match(/\d\d\:\d\d\:\d\d.*\:\s.*reached the finish in/));

    const parsedTimes: Record<string, number> = {};

    logLines.forEach((line: string) => {
      const matchResult: RegExpMatchArray | null = line.match(
        /\d\d\:\d\d\:\d\d\s(.*)\sreached the finish line in (.*) \(.*/,
      );

      if (!matchResult || !matchResult[0] || !matchResult[1] || !matchResult[2]) {
        return;
      }

      const serverNick: string = matchResult[1];
      const stringTimeSplit: string[] = matchResult[2].split(':');
      let playerTime: number;

      if (stringTimeSplit.length === 3) {
        playerTime = Number(stringTimeSplit[0]) * 60 + Number(stringTimeSplit[1]) + Number(stringTimeSplit[2]) / 1000;
      } else {
        playerTime = Number(stringTimeSplit[0]) + Number(stringTimeSplit[1]) / 1000;
      }

      if (!parsedTimes[serverNick] || parsedTimes[serverNick] > playerTime) {
        parsedTimes[serverNick] = playerTime;
      }
    });

    const parsedTimeArray: { serverNick: string; time: number }[] = Object.keys(parsedTimes)
      .map((serverNick: string) => ({
        serverNick,
        time: parsedTimes[serverNick],
      }))
      .sort((entryA, entryB) => entryA.time - entryB.time);

    const cupPlayersInfo: { userId: number; nick1: string; nick2: string }[] = (
      await this.cupsResultsRepository
        .createQueryBuilder('cups_results')
        .leftJoinAndSelect('cups_results.user', 'users')
        .where({ cup: { id: cupId } })
        .getMany()
    ).map((cupResult: CupResult) => ({
      userId: cupResult.user.id,
      nick1: cupResult.user.displayed_nick,
      nick2: cupResult.user.login,
    }));

    const allPlayersNicknames: string[] = cupPlayersInfo.reduce(
      (acc: string[], elem: { userId: number; nick1: string; nick2: string }) => {
        return [...acc, elem.nick1, elem.nick2];
      },
      [],
    );

    const parsedOnlineCupRound: ParsedOnlineCupRoundInterface = {
      roundResults: parsedTimeArray.map(({ serverNick, time }: { serverNick: string; time: number }) => {
        const closestNick: string = closest(serverNick, allPlayersNicknames);
        const levenshteinDistance: number = distance(serverNick, closestNick);
        const userId: number = cupPlayersInfo.find(
          ({ nick1, nick2 }: { userId: number; nick1: string; nick2: string }) =>
            nick1 === closestNick || nick2 === closestNick,
        )!.userId;

        return {
          serverNick,
          suggestedPlayer:
            levenshteinDistance < 5
              ? {
                  userId,
                  nick: closestNick,
                }
              : null,
          time,
        };
      }),
    };

    return parsedOnlineCupRound;
  }

  public async saveRoundResults(
    accessToken: string | undefined,
    cupId: number,
    roundNumber: 1 | 2 | 3 | 4 | 5,
    roundResults: RoundResultEntryInterface[],
  ): Promise<void> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!checkUserRoles(userAccess.roles, [UserRoles.CUP_ORGANIZER])) {
      throw new UnauthorizedException('Unauthorized to parse server logs without CUP_ORGANIZER role');
    }

    if (![1, 2, 3, 4, 5].includes(roundNumber)) {
      throw new BadRequestException('Wrong roundNumber - should be one of [1, 2, 3, 4, 5]');
    }

    const cupResults: CupResult[] = await this.cupsResultsRepository
      .createQueryBuilder('cups_results')
      .leftJoinAndSelect('cups_results.user', 'users')
      .where({ cup: { id: cupId } })
      .getMany();

    const cupResultsUpdate = cupResults.map((cupResult: CupResult) => {
      const userResult: RoundResultEntryInterface | undefined = roundResults.find(
        (result: RoundResultEntryInterface) => result.userId === cupResult.user.id,
      );

      if (userResult) {
        return { ...cupResult, ['time' + roundNumber]: userResult.time };
      } else {
        return cupResult;
      }
    });

    await this.cupsResultsRepository.save(cupResultsUpdate);
  }

  public async setOnlineCupMaps(
    accessToken: string | undefined,
    cupId: number,
    maps: (string | null)[],
  ): Promise<void> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!checkUserRoles(userAccess.roles, [UserRoles.CUP_ORGANIZER])) {
      throw new UnauthorizedException('Unauthorized to set online cup maps without CUP_ORGANIZER role');
    }

    await this.cupsRepository
      .createQueryBuilder('cups')
      .update(Cup)
      .set({
        map1: maps[0],
        map2: maps[1],
        map3: maps[2],
        map4: maps[3],
        map5: maps[4],
      })
      .where({ id: cupId })
      .execute();
  }

  public async getOnlineCupPlayers(accessToken: string | undefined, cupId: number): Promise<OnlineCupPlayersInterface> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!checkUserRoles(userAccess.roles, [UserRoles.CUP_ORGANIZER])) {
      throw new UnauthorizedException('Unauthorized to get online cup players without CUP_ORGANIZER role');
    }

    const onlineCupPlayers: CupResult[] = await this.cupsResultsRepository
      .createQueryBuilder('cups_results')
      .leftJoinAndSelect('cups_results.user', 'users')
      .where({ cup: { id: cupId } })
      .getMany();

    return {
      players: onlineCupPlayers.map((onlineCupPlayer: CupResult) => ({
        userId: onlineCupPlayer.user.id,
        nick: onlineCupPlayer.user.displayed_nick,
      })),
    };
  }

  // TODO Split this into several methods, maybe separate class. Add constants and rating system references
  public async finishOnlineCup(accessToken: string | undefined, cupId: number): Promise<void> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!checkUserRoles(userAccess.roles, [UserRoles.CUP_ORGANIZER])) {
      throw new UnauthorizedException('Unauthorized to get online cup players without CUP_ORGANIZER role');
    }

    const cup: Cup | null = await this.cupsRepository.createQueryBuilder('cups').where({ id: cupId }).getOne();

    if (!cup) {
      throw new NotFoundException(`Cup with id = ${cupId} not found`);
    }

    const onlineCupResults: CupResult[] = await this.cupsResultsRepository
      .createQueryBuilder('cups_results')
      .leftJoinAndSelect('cups_results.user', 'users')
      .where({ cup: { id: cupId } })
      .getMany();

    const onlineCupFullTable: MulticupTableInterface = await this.tablesService.getOnlineCupFullTable(cupId);
    const { season }: Season = (await this.seasonRepository.createQueryBuilder('season').getOne())!;

    const onlineCupResultsWithFinalSum: CupResult[] = onlineCupResults
      .map((cupResult: CupResult) => {
        const targetPlayerTableEntry: MulticupResultInterface | undefined = onlineCupFullTable.players.find(
          (result: MulticupResultInterface) => result.playerId === cupResult.user.id,
        );

        if (targetPlayerTableEntry) {
          return { ...cupResult, final_sum: targetPlayerTableEntry.overall };
        } else {
          return cupResult;
        }
      })
      .filter((cupResult: CupResult) => !!cupResult.final_sum)
      .sort((resultA: CupResult, resultB: CupResult) => resultB.final_sum! - resultA.final_sum!);

    await this.cupsResultsRepository.save(onlineCupResultsWithFinalSum);

    let bonusPointsEfficiency = (onlineCupResultsWithFinalSum.length - 3) / 27;

    if (bonusPointsEfficiency < 0) {
      bonusPointsEfficiency = 0;
    }

    if (bonusPointsEfficiency > 1) {
      bonusPointsEfficiency = 1;
    }

    let averageRating = 0;

    onlineCupResultsWithFinalSum.forEach((cupResult: CupResult) => {
      const playerRating = Physics.CPM ? cupResult.user.cpm_rating || 1500 : cupResult.user.vq3_rating || 1500;

      averageRating += playerRating;
    });

    averageRating /= onlineCupResultsWithFinalSum.length;

    const updatedPlayersRatings: DeepPartial<User>[] = [];
    const ratingChanges: DeepPartial<RatingChange>[] = [];
    let currentPlace = 0;

    onlineCupResultsWithFinalSum.forEach((cupResult: CupResult, index: number) => {
      if (index === 0 || cupResult.final_sum !== onlineCupResultsWithFinalSum[index - 1].final_sum) {
        currentPlace++;
      }

      const participatedMapsCount: number = [
        cupResult.time1,
        cupResult.time2,
        cupResult.time3,
        cupResult.time4,
        cupResult.time5,
      ].filter((time: number | null) => !!time).length;

      const efficiency: number = cupResult.final_sum! / (1000 * participatedMapsCount);
      const userRating: number = cup.physics === Physics.VQ3 ? cupResult.user.vq3_rating : cupResult.user.cpm_rating;
      const expectation: number = 1 / (1 + Math.pow(10, (averageRating - userRating) / 400));
      let ratingChange: number = Math.round(12 * participatedMapsCount * (efficiency - expectation));

      // Removing rating loss for players lower than 1700
      if (userRating < 1700 && ratingChange < 0) {
        ratingChange = 0;
      }

      // Adding rating for online cup rounds
      if (userRating < 2000) {
        ratingChange += 2 * participatedMapsCount;
      }

      // Adding ratings for top 3 (+15 +10 +5 for 3 players, +50 +30 +20 for 30+ players)
      if (currentPlace === 1) {
        ratingChange += Math.round(bonusPointsEfficiency * (50 - 15) + 15);
      }

      if (currentPlace === 2) {
        ratingChange += Math.round(bonusPointsEfficiency * (30 - 10) + 10);
      }

      if (currentPlace === 3) {
        ratingChange += Math.round(bonusPointsEfficiency * (20 - 5) + 5);
      }

      if (cup.physics === Physics.VQ3) {
        updatedPlayersRatings.push({
          id: cupResult.user.id,
          vq3_rating: cupResult.user.vq3_rating + ratingChange,
        });

        ratingChanges.push({
          user: { id: cupResult.user.id },
          cup: { id: cupId },
          season,
          bonus: false,
          vq3_change: ratingChange,
          vq3_place: currentPlace,
        });
      } else {
        updatedPlayersRatings.push({
          id: cupResult.user.id,
          cpm_rating: cupResult.user.cpm_rating + ratingChange,
        });

        ratingChanges.push({
          user: { id: cupResult.user.id },
          cup: { id: cupId },
          season,
          bonus: false,
          cpm_change: ratingChange,
          cpm_place: currentPlace,
        });
      }
    });

    // Updating ratings and inserting rating changes into database
    await this.usersRepository.save(updatedPlayersRatings);
    await this.ratingChangesRepository.save(ratingChanges);
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
          const addedDemo: Unpacked<AdminPlayerDemosValidationInterface['demos']> = {
            time: playerDemo.time,
            validationStatus: playerDemo.verified_status,
            validationFailedReason: playerDemo.reason,
            demoLink: `/uploads/demos/cup${cupId}/${playerDemo.demopath}`,
            id: playerDemo.id,
            isOrganizer: playerDemo.isOrganizer,
            isOutsideCompetition: playerDemo.isOutsideCompetition,
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
              isOrganizer: playerDemo.isOrganizer,
              isOutsideCompetition: playerDemo.isOutsideCompetition,
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

  private async calculateOfflineRating(cup: Cup, physics: Physics): Promise<void> {
    let offlineCupTable: ValidDemoInterface[] = (
      await this.tablesService.getOfflineCupTable(cup, physics, { filterExcludedDemos: true })
    ).valid;

    const otherPhysics = physics === Physics.CPM ? Physics.VQ3 : Physics.CPM;
    const otherPhysicsOfflineCupTable: ValidDemoInterface[] = (
      await this.tablesService.getOfflineCupTable(cup, otherPhysics, { filterExcludedDemos: true })
    ).valid;

    let averageRating = 0;

    offlineCupTable = offlineCupTable.map((demo: ValidDemoInterface) => {
      // TODO Can be simplified if all zero points ratings are replaced by 1500 in database.
      // atm the difference between 0 and 1500 is that 0 never participated in season and won't be in the final season table.
      // so there needs to be another boolean key to indicate the difference between 0 and 1500
      const demoRating = demo.rating === 0 ? 1500 : demo.rating;

      averageRating += demoRating;

      return { ...demo, rating: demoRating };
    });

    averageRating /= offlineCupTable.length;

    let currentResultCounter = 1;
    let onlyBonusRatingPlayersCount = 0;

    let tableWithCalculatedRatings: TableEntryWithRatingInterface[] = offlineCupTable.map(
      (demo: ValidDemoInterface, index: number) => {
        let currentPlayerPlace: number;

        if (index === 0) {
          currentPlayerPlace = 1;
        } else {
          if (demo.time !== offlineCupTable[index - 1].time) {
            currentResultCounter++;
          }

          currentPlayerPlace = currentResultCounter;
        }

        const efficiency: number = 1 - (currentPlayerPlace - 1) / offlineCupTable.length;
        const expectation: number = 1 / (1 + Math.pow(10, (averageRating - demo.rating) / 400));
        let ratingChange: number = Math.round(70 * (efficiency - expectation));
        let sub2KBonusRatingChange: number = 0;

        if (demo.rating < 2000) {
          if (demo.change! < 0) {
            sub2KBonusRatingChange = 10 - onlyBonusRatingPlayersCount;
            sub2KBonusRatingChange = sub2KBonusRatingChange < 1 ? 1 : sub2KBonusRatingChange;
            onlyBonusRatingPlayersCount++;
          } else {
            sub2KBonusRatingChange = 10;
          }
        }

        ratingChange += sub2KBonusRatingChange + cup.bonus_rating;

        const hasBothPhysicsBonus: boolean = otherPhysicsOfflineCupTable.some(
          (otherDemo: ValidDemoInterface) => otherDemo.playerId === demo.playerId,
        );

        if (hasBothPhysicsBonus) {
          ratingChange += 5;
        }

        return {
          ...demo,
          ratingChange,
          hasBothPhysicsBonus,
          placeInTable: currentPlayerPlace,
        };
      },
    );

    tableWithCalculatedRatings = this.addTop3BonusRatings(tableWithCalculatedRatings);
    tableWithCalculatedRatings = this.recalculateChangeFor1700(tableWithCalculatedRatings);

    const playersUpdate: Partial<User>[] = tableWithCalculatedRatings.map(
      ({ playerId, ratingChange, rating }: TableEntryWithRatingInterface) => ({
        id: playerId,
        [`${physics}_rating`]: rating + ratingChange,
      }),
    );

    const { season }: Season = (await this.seasonRepository.createQueryBuilder('season').getOne())!;

    const ratingChanges: DeepPartial<RatingChange>[] = tableWithCalculatedRatings.map(
      (tableEntry: TableEntryWithRatingInterface) => {
        return {
          cpm_change: physics === Physics.CPM ? tableEntry.ratingChange : null,
          vq3_change: physics === Physics.VQ3 ? tableEntry.ratingChange : null,
          cpm_place: physics === Physics.CPM ? tableEntry.placeInTable : null,
          vq3_place: physics === Physics.VQ3 ? tableEntry.placeInTable : null,
          bonus: tableEntry.hasBothPhysicsBonus,
          season,
          user: { id: tableEntry.playerId },
          cup: { id: cup.id },
          multicup: null,
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
  private addTop3BonusRatings(table: TableEntryWithRatingInterface[]): TableEntryWithRatingInterface[] {
    const resultTable: TableEntryWithRatingInterface[] = [...table];
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

    while (playerIndex < resultTable.length && resultTable[playerIndex].time === resultTable[playerIndex - 1].time) {
      resultTable[playerIndex].ratingChange += firstPlaceBonus;
      playerIndex++;
    }

    if (playerIndex < resultTable.length) {
      resultTable[playerIndex].ratingChange += secondPlaceBonus;
      playerIndex++;
    }

    while (playerIndex < resultTable.length && resultTable[playerIndex].time === resultTable[playerIndex - 1].time) {
      resultTable[playerIndex].ratingChange += secondPlaceBonus;
      playerIndex++;
    }

    if (playerIndex < resultTable.length) {
      resultTable[playerIndex].ratingChange += thirdPlaceBonus;
      playerIndex++;
    }

    while (playerIndex < resultTable.length && resultTable[playerIndex].time === resultTable[playerIndex - 1].time) {
      resultTable[playerIndex].ratingChange += thirdPlaceBonus;
      playerIndex++;
    }

    return resultTable;
  }

  private recalculateChangeFor1700(table: TableEntryWithRatingInterface[]): TableEntryWithRatingInterface[] {
    return table.map((tableEntry: TableEntryWithRatingInterface) => {
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
}
