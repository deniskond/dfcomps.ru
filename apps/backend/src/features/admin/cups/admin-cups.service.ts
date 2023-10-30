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
  AddCupDto,
  AdminActiveMulticupInterface,
  AdminCupInterface,
  AdminEditOfflineCupInterface,
  AdminPlayerDemosValidationInterface,
  AdminValidationInterface,
  CupTypes,
  UpdateCupDto,
  NewsTypes,
  Physics,
  ProcessValidationDto,
  ResultsTableInterface,
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

@Injectable()
export class AdminCupsService {
  constructor(
    private readonly authService: AuthService,
    private readonly tablesService: TablesService,
    @InjectRepository(Cup) private readonly cupsRepository: Repository<Cup>,
    @InjectRepository(News) private readonly newsRepository: Repository<News>,
    @InjectRepository(Multicup) private readonly multicupsRepository: Repository<Multicup>,
    @InjectRepository(CupDemo) private readonly cupsDemosRepository: Repository<CupDemo>,
    @InjectRepository(Season) private readonly seasonRepository: Repository<Season>,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(RatingChange) private readonly ratingChangesRepository: Repository<RatingChange>,
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
      validationAvailable:
        (cup.rating_calculated === false &&
          cup.type === CupTypes.OFFLINE &&
          moment().isAfter(moment(cup.end_datetime))) ||
        isSuperadmin(userAccess.roles),
      calculateRatingsAvailable: cup.rating_calculated === false && cup.demos_validated === true,
      endDateTime: cup.end_datetime,
    }));
  }

  public async getSingleCup(accessToken: string | undefined, cupId: number): Promise<AdminEditOfflineCupInterface> {
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
    };
  }

  public async addCup(accessToken: string | undefined, addCupDto: AddCupDto): Promise<void> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!checkUserRoles(userAccess.roles, [UserRoles.CUP_ORGANIZER])) {
      throw new UnauthorizedException('Unauthorized to add cup without CUP_ORGANIZER role');
    }

    const startDatetime = moment(addCupDto.startTime).tz('Europe/Moscow').format();
    const endDatetime = moment(addCupDto.endTime).tz('Europe/Moscow').format();

    const queryResult: InsertResult = await this.cupsRepository
      .createQueryBuilder()
      .insert()
      .into(Cup)
      .values([
        {
          full_name: addCupDto.fullName,
          short_name: addCupDto.shortName,
          youtube: null,
          twitch: null,
          current_round: 1,
          start_datetime: startDatetime,
          end_datetime: endDatetime,
          server1: '',
          server2: '',
          map1: addCupDto.mapName,
          map2: null,
          map3: null,
          map4: null,
          map5: null,
          physics: 'mixed',
          type: CupTypes.OFFLINE,
          map_weapons: addCupDto.weapons,
          map_author: addCupDto.mapAuthor,
          map_pk3: addCupDto.mapPk3Link,
          map_size: addCupDto.size,
          archive_link: null,
          bonus_rating: 0,
          system: null,
          custom_map: null,
          custom_news: null,
          validation_archive_link: null,
          timer: false,
          rating_calculated: false,
          use_two_servers: false,
          demos_validated: false,
          multicup: addCupDto.multicupId ? { id: addCupDto.multicupId } : null,
        },
      ])
      .execute();

    if (addCupDto.addNews) {
      const cupId: number = queryResult.identifiers[0].id;

      await this.newsRepository
        .createQueryBuilder()
        .insert()
        .into(News)
        .values([
          {
            header: `Старт ${addCupDto.fullName}!`,
            header_en: `${addCupDto.fullName} start!`,
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
            header: `Результаты ${addCupDto.fullName}`,
            header_en: `Results: ${addCupDto.fullName}`,
            text: '',
            text_en: '',
            youtube: null,
            user: { id: userAccess.userId! },
            datetimezone: startDatetime,
            newsType: { id: mapNewsTypeEnumToDBNewsTypeId(NewsTypes.OFFLINE_RESULTS) },
            cup: { id: cupId },
            comments_count: 0,
            hide_on_main: false,
          },
        ])
        .execute();
    }
  }

  public async updateCup(accessToken: string | undefined, updateCupDto: UpdateCupDto, cupId: number): Promise<void> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!checkUserRoles(userAccess.roles, [UserRoles.CUP_ORGANIZER])) {
      throw new UnauthorizedException('Unauthorized to edit cup without CUP_ORGANIZER role');
    }

    const cup: Cup | null = await this.cupsRepository.createQueryBuilder('cups').where({ id: cupId }).getOne();

    if (!cup) {
      throw new NotFoundException(`Cup with id = ${cupId} not found`);
    }

    const startDatetime = moment(updateCupDto.startTime).tz('Europe/Moscow').format();
    const endDatetime = moment(updateCupDto.endTime).tz('Europe/Moscow').format();

    if (updateCupDto.mapPk3Link) {
      const absolutePk3Link = process.env.DFCOMPS_FILES_ABSOLUTE_PATH + updateCupDto.mapPk3Link;

      if (fs.existsSync(absolutePk3Link)) {
        fs.rmSync(absolutePk3Link);
      }
    }

    await this.cupsRepository
      .createQueryBuilder()
      .update(Cup)
      .set({
        full_name: updateCupDto.fullName,
        short_name: updateCupDto.shortName,
        start_datetime: startDatetime,
        end_datetime: endDatetime,
        map1: updateCupDto.mapName,
        map_weapons: updateCupDto.weapons,
        map_author: updateCupDto.mapAuthor,
        map_pk3: updateCupDto.mapPk3Link || undefined,
        map_size: updateCupDto.size,
        multicup: updateCupDto.multicupId ? { id: updateCupDto.multicupId } : undefined,
      })
      .where({ id: cupId })
      .execute();

    if (updateCupDto.addNews) {
      await this.newsRepository
        .createQueryBuilder('news')
        .update(News)
        .set({
          header: `Старт ${updateCupDto.fullName}!`,
          header_en: `${updateCupDto.fullName} start!`,
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
          header: `Результаты ${updateCupDto.fullName}`,
          header_en: `Results: ${updateCupDto.fullName}`,
          user: { id: userAccess.userId! },
          datetimezone: startDatetime,
        })
        .where({ cup: { id: cupId } })
        .andWhere({ newsType: { id: mapNewsTypeEnumToDBNewsTypeId(NewsTypes.OFFLINE_RESULTS) } })
        .execute();
    }
  }

  public async deleteCup(accessToken: string | undefined, cupId: number): Promise<void> {}

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
      ({ id, validationStatus, reason }: ValidationResultInterface) => ({
        id,
        reason,
        verified_status: validationStatus,
      }),
    );

    await this.cupsDemosRepository.save(targetEntries);

    if (moment().isAfter(moment(cup.end_datetime)) && targetEntries.length === allDemosCount) {
      await this.cupsRepository
        .createQueryBuilder()
        .update(Cup)
        .set({ demos_validated: true })
        .where({ id: cupId })
        .execute();
    }
  }

  public async calculateRating(accessToken: string | undefined, cupId: number): Promise<void> {
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

    if (cup.type === CupTypes.OFFLINE) {
      this.calculateOfflineRating(cup, Physics.VQ3);
      this.calculateOfflineRating(cup, Physics.CPM);
    } else if (cup.type === CupTypes.ONLINE) {
      this.calculateOnlineRating(cup);
    } else {
      throw new NotImplementedException(`Unknown cup type ${cup.type}`);
    }

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
    levelshot: Express.Multer.File,
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
    map: Express.Multer.File,
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

  private async calculateOfflineRating(cup: Cup, physics: Physics): Promise<void> {
    let offlineCupTable: ValidDemoInterface[] = (await this.tablesService.getOfflineCupTable(cup, physics)).valid;

    const otherPhysics = cup.physics === Physics.CPM ? Physics.VQ3 : Physics.CPM;
    const otherPhysicsOfflineCupTable: ValidDemoInterface[] = (
      await this.tablesService.getOfflineCupTable(cup, otherPhysics)
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

  // TODO
  private async calculateOnlineRating(cup: Cup): Promise<void> {}

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

      if (tableEntry.rating > 1700 && tableEntry.rating + ratingChange < 1700) {
        ratingChange = 1700 - tableEntry.rating;
      }

      return {
        ...tableEntry,
        ratingChange,
      };
    });
  }
}
