import {
  DemoUploadResult,
  Physics,
  UploadDemoResponseInterface,
  ValidationErrorInterface,
  WrLastFiveItemInterface,
  WrListItemInterface,
  WrListResponseInterface,
  WrPlayerSearchItemInterface,
} from '@dfcomps/contracts';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as archiver from 'archiver';
import { AuthService } from '../auth/auth.service';
import { UserAccessInterface } from '../../shared/interfaces/user-access.interface';
import { WorldRecord } from '../../shared/entities/world-record.entity';
import { User } from '../../shared/entities/user.entity';
import { DemoParser } from '../demos/demo-parser/demo-parser';
import { DemoCheckResultInterface } from '../demos/demo-check-result.interface';
import { DemoConfigInterface } from '../demos/demo-config.interface';
import { MulterFileInterface } from '../../shared/interfaces/multer.interface';
import { MapParsingService } from '../../shared/services/map-parsing.service';
import { WrPlayerType } from './dto/upload-wr-demo.dto';
import { LoggerService } from '../../shared/services/logger.service';

const WR_DEMOS_SUBDIR = 'demos/wrecords';
const PAGE_SIZE = 25;

// Filename pattern: mapName[df|mdf.vq3|cpm]mm.ss.mmm(playerName.country)<anything>.dm_68
// Groups: 1=mapName, 2=df|mdf, 3=physics, 4=minutes, 5=seconds, 6=milliseconds, 7=playerName, 8=country
const WR_FILENAME_PATTERN = /^(.+)\[(df|mdf)\.(vq3|cpm)\](\d+)\.(\d+)\.(\d{3})\((.*)\.(.*)\).*\.dm_68$/;

@Injectable()
export class WorldRecordsService {
  constructor(
    @InjectRepository(WorldRecord) private readonly worldRecordRepository: Repository<WorldRecord>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly authService: AuthService,
    private readonly mapParsingService: MapParsingService,
    private readonly loggerService: LoggerService,
  ) {}

  public async uploadWrDemo(
    accessToken: string | undefined,
    demo: MulterFileInterface,
    playerType: WrPlayerType,
    userId?: number,
  ): Promise<UploadDemoResponseInterface> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!userAccess.userId) {
      return { status: DemoUploadResult.ERROR, message: 'Not authorized' };
    }

    const fileName = demo.originalname;
    const patternMatch: RegExpMatchArray | null = fileName.match(WR_FILENAME_PATTERN);

    if (!patternMatch) {
      return { status: DemoUploadResult.ERROR, message: 'Wrong demo name, check df_ar_format' };
    }

    const mapNameFromFilename: string = patternMatch[1];
    const physics: Physics | string = patternMatch[3];
    const dfName: string = patternMatch[7];
    const demoTimeFromFilename: number =
      parseInt(patternMatch[4]) * 60 + parseInt(patternMatch[5]) + parseInt(patternMatch[6]) / 1000;

    if (physics !== Physics.CPM && physics !== Physics.VQ3) {
      return { status: DemoUploadResult.ERROR, message: 'Wrong physics' };
    }

    // Verify map exists on Q3DF
    try {
      await this.mapParsingService.getParsedMapInfo(mapNameFromFilename);
    } catch {
      return { status: DemoUploadResult.ERROR, message: `Map ${mapNameFromFilename} not found` };
    }

    // Resolve target player
    let targetPlayer: User | null = null;
    let targetDfName: string | null = null;

    if (playerType === WrPlayerType.MY_DEMO) {
      targetPlayer =
        (await this.userRepository.createQueryBuilder('users').where({ id: userAccess.userId }).getOne()) ?? null;
    } else if (playerType === WrPlayerType.DFCOMPS_USER) {
      if (!userId) {
        return { status: DemoUploadResult.ERROR, message: 'userId is required for DFCOMPS_USER player type' };
      }
      targetPlayer = await this.userRepository.createQueryBuilder('users').where({ id: userId }).getOne();
      if (!targetPlayer) {
        return { status: DemoUploadResult.ERROR, message: 'Selected player not found' };
      }
    } else {
      targetDfName = dfName;
    }

    // Write demo to temp location for parsing
    this.makeDemosDirectoryIfNotExists();
    const tmpDir = process.env.DFCOMPS_FILES_ABSOLUTE_PATH + `/${WR_DEMOS_SUBDIR}/tmp`;
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }

    const tmpFilename = `tmp_${Date.now()}.dm_68`;
    const tmpFullPath = tmpDir + '/' + tmpFilename;
    fs.writeFileSync(tmpFullPath, demo.buffer);

    // Validate demo
    const demoCheckResult: DemoCheckResultInterface = this.checkWrDemo(
      tmpFullPath,
      mapNameFromFilename,
      physics as Physics,
      demoTimeFromFilename,
    );

    if (!demoCheckResult.valid) {
      fs.rmSync(tmpFullPath);
      this.loggerService.error(
        `WR upload for map ${mapNameFromFilename} failed: invalid demo. Errors: ${JSON.stringify(demoCheckResult.errors)}. User ID: ${userAccess.userId}`,
      );
      return { status: DemoUploadResult.INVALID, errors: demoCheckResult.errors, warnings: demoCheckResult.warnings };
    }

    // Parser time is primary; fall back to filename time if parser didn't produce a time
    const demoTime = demoCheckResult.time ?? demoTimeFromFilename;

    // Check existing WR
    const existingWr: WorldRecord | null = await this.worldRecordRepository
      .createQueryBuilder('wr')
      .where('wr.map = :map', { map: mapNameFromFilename })
      .andWhere('wr.physics = :physics', { physics })
      .orderBy('wr.time', 'ASC')
      .getOne();

    if (existingWr && existingWr.time <= demoTime) {
      fs.rmSync(tmpFullPath);
      return { status: DemoUploadResult.ERROR, message: 'Current world record is equal or better' };
    }

    // Archive demo to zip
    const wrDir = process.env.DFCOMPS_FILES_ABSOLUTE_PATH + `/${WR_DEMOS_SUBDIR}`;
    const resultFilename = fileName.replace(/#/g, '').replace('.dm_68', '') + '.zip';
    const zipFullPath = wrDir + '/' + resultFilename;

    await this.archiveDemoToZip(tmpFullPath, fileName, zipFullPath);
    fs.rmSync(tmpFullPath);

    // Insert new WR row
    await this.worldRecordRepository
      .createQueryBuilder()
      .insert()
      .into(WorldRecord)
      .values([
        {
          map: mapNameFromFilename,
          physics: physics as Physics,
          time: demoTime,
          demopath: `${WR_DEMOS_SUBDIR}/${resultFilename}`,
          player: targetPlayer ?? undefined,
          df_name: targetDfName,
        },
      ])
      .execute();

    this.loggerService.info(
      `WR upload for map ${mapNameFromFilename} (${physics}) success. Time: ${demoTime}. User ID: ${userAccess.userId}`,
    );

    return { status: DemoUploadResult.SUCCESS, warnings: demoCheckResult.warnings };
  }

  public async getWrList(page: number, filter: string, physics: string): Promise<WrListResponseInterface> {
    const subQuery = this.worldRecordRepository
      .createQueryBuilder()
      .subQuery()
      .select('MIN(sub.time)')
      .from(WorldRecord, 'sub')
      .where('sub.map = wr.map')
      .andWhere('sub.physics = wr.physics')
      .getQuery();

    const qb = this.worldRecordRepository
      .createQueryBuilder('wr')
      .leftJoinAndSelect('wr.player', 'player')
      .where(`wr.time = (${subQuery})`);

    if (filter) {
      qb.andWhere('wr.map ILIKE :filter', { filter: `%${filter}%` });
    }

    if (physics === Physics.VQ3 || physics === Physics.CPM) {
      qb.andWhere('wr.physics = :physics', { physics });
    }

    const totalCount = await qb.getCount();

    const records: WorldRecord[] = await qb
      .orderBy('wr.map', 'ASC')
      .skip((page - 1) * PAGE_SIZE)
      .take(PAGE_SIZE)
      .getMany();

    return {
      records: records.map((wr) => this.mapToListItem(wr)),
      totalCount,
    };
  }

  public async getLastFive(): Promise<WrLastFiveItemInterface[]> {
    const subQuery = this.worldRecordRepository
      .createQueryBuilder()
      .subQuery()
      .select('MIN(sub.time)')
      .from(WorldRecord, 'sub')
      .where('sub.map = wr.map')
      .andWhere('sub.physics = wr.physics')
      .getQuery();

    const records: WorldRecord[] = await this.worldRecordRepository
      .createQueryBuilder('wr')
      .leftJoinAndSelect('wr.player', 'player')
      .where(`wr.time = (${subQuery})`)
      .orderBy('wr.uploaded_at', 'DESC')
      .take(5)
      .getMany();

    return records.map((wr) => ({
      map: wr.map,
      time: wr.time,
      physics: wr.physics,
      uploadedAt: wr.uploaded_at.toISOString(),
      playerId: wr.player?.id ?? null,
      playerNick: wr.player?.displayed_nick ?? wr.df_name ?? null,
      playerCountry: wr.player?.country ?? null,
    }));
  }

  public async searchPlayers(accessToken: string | undefined, nick: string): Promise<WrPlayerSearchItemInterface[]> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!userAccess.userId) {
      return [];
    }

    if (!nick) {
      return [];
    }

    const players: User[] = await this.userRepository
      .createQueryBuilder('users')
      .select(['users.id', 'users.displayed_nick', 'users.country'])
      .where('users.displayed_nick ILIKE :nick', { nick: `%${nick}%` })
      .limit(10)
      .getMany();

    return players.map((user) => ({
      id: user.id,
      nick: user.displayed_nick,
      country: user.country,
    }));
  }

  private mapToListItem(wr: WorldRecord): WrListItemInterface {
    return {
      map: wr.map,
      time: wr.time,
      physics: wr.physics,
      demoLink: `/uploads/${wr.demopath}`,
      uploadedAt: wr.uploaded_at.toISOString(),
      playerId: wr.player?.id ?? null,
      playerNick: wr.player?.displayed_nick ?? wr.df_name ?? null,
      playerCountry: wr.player?.country ?? null,
    };
  }

  private checkWrDemo(
    demoPath: string,
    mapName: string,
    physics: Physics,
    demoTimeFromFilename: number,
  ): DemoCheckResultInterface {
    const demoConfig: DemoConfigInterface | null = new DemoParser().parseDemo(demoPath);

    if (!demoConfig) {
      return {
        valid: false,
        errors: { parse_failed: { message: 'Demo file could not be parsed' } },
        warnings: [],
        maxSpeed: null,
        time: null,
      };
    }

    let valid = true;
    const errors: Record<string, ValidationErrorInterface> = {};
    const warnings: string[] = [];
    const isOfflineDemo = demoConfig.defragGameType && demoConfig.defragGameType === '1';

    // Cross-validate: parser time vs filename time
    const [minutes, seconds, milliseconds] = demoConfig.time?.split('.') ?? [];
    const parsedTime: number | null =
      minutes !== undefined && seconds !== undefined && milliseconds !== undefined
        ? parseInt(minutes) * 60 + parseInt(seconds) + parseInt(milliseconds) / 1000
        : null;

    if (parsedTime && parsedTime !== demoTimeFromFilename) {
      valid = false;
      errors.demoname_time = {
        actual: demoTimeFromFilename.toString(),
        expected: parsedTime.toString(),
      };
    }

    if (demoConfig.g_synchronousClients === '0' && demoConfig.pmove_fixed === '0') {
      valid = false;
      errors.pmove_and_gsync = {
        actual: 'g_synchronousclients=0, pmove_fixed=0',
        expected: 'g_synchronousclients=1 OR pmove_fixed=1',
      };
    }

    if (demoConfig.mapName.toLowerCase() !== mapName.toLowerCase()) {
      valid = false;
      errors.mapname = {
        actual: demoConfig.mapName.toLowerCase(),
        expected: mapName.toLowerCase(),
      };
    }

    if (parseInt(demoConfig.defragVersion) < 19123) {
      valid = false;
      errors.defrag_version = {
        actual: demoConfig.defragVersion,
        expected: '1.91.23 or higher',
      };
    }

    if (demoConfig.physic !== physics) {
      valid = false;
      errors.physics = {
        actual: demoConfig.physic,
        expected: physics,
      };
    }

    if (demoConfig.g_gravity !== '800') {
      valid = false;
      errors.g_gravity = { actual: demoConfig.g_gravity, expected: '800' };
    }

    if (demoConfig.g_knockback !== '1000') {
      valid = false;
      errors.g_knockback = { actual: demoConfig.g_knockback, expected: '1000' };
    }

    if (demoConfig.g_speed !== '320') {
      valid = false;
      errors.g_speed = { actual: demoConfig.g_speed, expected: '320' };
    }

    if (demoConfig.pmove_msec !== '8') {
      valid = false;
      errors.pmove_msec = { actual: demoConfig.pmove_msec, expected: '8' };
    }

    if (demoConfig.sv_cheats !== '0') {
      valid = false;
      errors.sv_cheats = { actual: demoConfig.sv_cheats, expected: '0' };
    }

    if (demoConfig.timescale !== '1') {
      valid = false;
      errors.timescale = { actual: demoConfig.timescale, expected: '1' };
    }

    if (demoConfig.isTimeReset) {
      valid = false;
      errors.timereset = { actual: 'TR', expected: 'no TR' };
    }

    // Offline-specific checks
    if (isOfflineDemo) {
      if (demoConfig.serverFPS !== '125') {
        valid = false;
        errors.defrag_svfps = { actual: demoConfig.serverFPS, expected: '125' };
      }
      if (demoConfig.handicap !== '100') {
        valid = false;
        errors.handicap = { actual: demoConfig.handicap, expected: '100' };
      }
    }

    if (demoConfig.areOBsEnabled === '1') {
      warnings.push('killobs 0');
    }

    return { valid, errors, warnings, maxSpeed: null, time: parsedTime };
  }

  private archiveDemoToZip(demoPath: string, demoName: string, zipPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const writeStream = fs.createWriteStream(zipPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      writeStream.on('close', resolve);
      archive.on('error', reject);

      archive.pipe(writeStream);
      archive.file(demoPath, { name: demoName });
      archive.finalize();
    });
  }

  private makeDemosDirectoryIfNotExists(): void {
    const wrDir = process.env.DFCOMPS_FILES_ABSOLUTE_PATH + `/${WR_DEMOS_SUBDIR}`;
    if (!fs.existsSync(wrDir)) {
      fs.mkdirSync(wrDir, { recursive: true });
    }
  }
}
