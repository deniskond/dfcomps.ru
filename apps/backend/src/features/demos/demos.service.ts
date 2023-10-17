import {
  DemoUploadResult,
  MulticupSystems,
  Physics,
  UploadDemoResponseInterface,
  ValidationErrorInterface,
  VerifiedStatuses,
} from '@dfcomps/contracts';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cup } from '../../shared/entities/cup.entity';
import * as moment from 'moment';
import * as fs from 'fs';
import { AuthService } from '../auth/auth.service';
import { UserAccessInterface } from '../../shared/interfaces/user-access.interface';
import { CupDemo } from '../../shared/entities/cup-demo.entity';
import { DemoParser } from './demo-parser';
import { DemoAcceptMode } from './demo-upload-mode.enum';
import { DemoCheckResultInterface } from './demo-check-result.interface';
import { DemoConfigInterface } from './demo-config.interface';

@Injectable()
export class DemosService {
  constructor(
    @InjectRepository(Cup) private readonly cupRepository: Repository<Cup>,
    @InjectRepository(CupDemo) private readonly cupsDemosRepository: Repository<CupDemo>,
    private readonly authService: AuthService,
  ) {}

  public async upload(
    accessToken: string,
    demo: Express.Multer.File,
    cupId: number,
    mapName: string,
  ): Promise<UploadDemoResponseInterface> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);

    if (!userAccess.userId) {
      return {
        status: DemoUploadResult.ERROR,
        message: 'Not authorized',
      };
    }

    const cup: Cup | null = await this.cupRepository
      .createQueryBuilder('cups')
      .leftJoinAndSelect('cups.multicup', 'multicups')
      .where({ id: cupId })
      .getOne();

    if (!cup) {
      return {
        status: DemoUploadResult.ERROR,
        message: 'Cup not found',
      };
    }

    if (moment().isAfter(moment(cup.end_datetime))) {
      return {
        status: DemoUploadResult.ERROR,
        message: 'Cup already finished',
      };
    }

    const demoDirectory = process.env.DFCOMPS_FILE_UPLOAD_PATH + `\\demos\\cup${cup.id}`;

    if (!fs.existsSync(demoDirectory)) {
      fs.mkdirSync(demoDirectory);
    }

    const fileName = demo.originalname;
    const pattern = new RegExp(`${mapName}\\[(.*)df\\.(.*)\\](\\d+)\\.(\\d+)\\.(\\d+)\\((.*)\\)\\.dm_68`);
    const patternMatch: RegExpMatchArray | null = fileName.match(pattern);

    if (!patternMatch) {
      return {
        status: DemoUploadResult.ERROR,
        message: 'Wrong demo name',
      };
    }

    const physics: Physics | string = patternMatch[2];

    if (physics !== Physics.CPM && physics !== Physics.VQ3) {
      return {
        status: DemoUploadResult.ERROR,
        message: 'Wrong physics',
      };
    }

    const playerDemos: CupDemo[] = await this.cupsDemosRepository
      .createQueryBuilder('cups_demos')
      .where('cups_demos.cupId = :cupId', { cupId: cup.id })
      .andWhere('cups_demos.physics = :physics', { physics })
      .andWhere('cups_demos.userId = :userId', { userId: userAccess.userId })
      .getMany();

    if (playerDemos.length >= 3) {
      return {
        status: DemoUploadResult.ERROR,
        message: 'More than three demos',
      };
    }

    const demoTime = parseInt(patternMatch[3]) * 60 + parseInt(patternMatch[4]) + parseInt(patternMatch[5]) / 1000;
    const randomSuffix = Math.floor(Math.random() * (99999 - 10001) + 10001);
    const resultFilename = fileName.replace(/#/g, '').replace('.dm_68', '') + `_${randomSuffix}.dm_68`;
    const demoFullName = demoDirectory + '\\' + resultFilename;

    fs.writeFileSync(demoFullName, demo.buffer);

    const demoAcceptMode =
      cup.multicup?.system === MulticupSystems.SDC ? DemoAcceptMode.OFFLINE_ONLY : DemoAcceptMode.OFFLINE_AND_ONLINE;

    const demoCheckResult: DemoCheckResultInterface = this.checkDemo(
      demoFullName,
      mapName,
      physics,
      null,
      demoAcceptMode,
    );

    if (demoCheckResult.valid) {
      await this.cupsDemosRepository
        .createQueryBuilder()
        .insert()
        .into(CupDemo)
        .values([
          {
            user: { id: userAccess.userId },
            cup: { id: cup.id },
            demopath: resultFilename,
            map: mapName,
            time: demoTime,
            physics,
            obs: demoCheckResult.warnings.includes('killobs 0'),
            verified_status: VerifiedStatuses.UNWATCHED,
            impressive: false,
          },
        ])
        .execute();

      return {
        status: DemoUploadResult.SUCCESS,
        errors: demoCheckResult.errors,
        warnings: demoCheckResult.warnings,
      };
    }
    else {
      fs.rmSync(demoFullName);

      return {
        status: DemoUploadResult.INVALID,
        errors: demoCheckResult.errors,
        warnings: demoCheckResult.warnings,
      };
    }
  }

  private checkDemo(
    demoPath: string,
    mapName: string,
    physics: Physics,
    securityCode = null,
    demoAcceptMode = DemoAcceptMode.OFFLINE_AND_ONLINE,
  ): DemoCheckResultInterface {
    const demoConfig: DemoConfigInterface = new DemoParser().parseDemo(demoPath);
    let valid = true;
    const errors: Record<string, ValidationErrorInterface> = {};
    const warnings = [];
    const isOfflineDemo = demoConfig.client.defrag_gametype && demoConfig.client.defrag_gametype === '1';

    // 1v1 upload check
    if (securityCode !== null && !demoConfig.raw['544'].match(securityCode)) {
      valid = false;
      errors.name = {
        actual: 'wrong code',
        expected: securityCode,
      };
    }

    if (demoAcceptMode === DemoAcceptMode.OFFLINE_ONLY && !isOfflineDemo) {
      valid = false;
      errors.demo_type = {
        actual: 'online',
        expected: 'offline',
      };
    }

    // offline unique checks
    if (isOfflineDemo) {
      if (demoConfig.game.defrag_svfps !== '125') {
        valid = false;
        errors.defrag_svfps = {
          actual: demoConfig.game.defrag_svfps,
          expected: '125',
        };
      }
      if (demoConfig.player.hc !== '100') {
        valid = false;
        errors.defrag_svfps = {
          actual: demoConfig.player.hc,
          expected: '100',
        };
      }
    }

    if ((demoConfig.client.mapname as string).toLowerCase() !== mapName.toLowerCase()) {
      valid = false;
      errors.mapname = {
        actual: demoConfig.client.mapname.toLowerCase(),
        expected: mapName.toLowerCase(),
      };
    }

    const allowedDefragVersions: string[] = ['19123', '19124', '19125', '19126', '19127', '19128', '19129', '19130'];

    if (!allowedDefragVersions.some((version: string) => version === demoConfig.client.defrag_vers)) {
      valid = false;
      errors.defrag_version = {
        actual: demoConfig.client.defrag_vers,
        expected: '1.91.23 - 1.91.30',
      };
    }

    if (demoConfig.physic !== physics) {
      valid = false;
      errors.physics = {
        actual: demoConfig.physic,
        expected: physics,
      };
    }

    if (demoConfig.game.g_gravity !== '800') {
      valid = false;
      errors.g_gravity = {
        actual: demoConfig.game.g_gravity,
        expected: '800',
      };
    }

    if (demoConfig.game.g_knockback !== '1000') {
      valid = false;
      errors.g_knockback = {
        actual: demoConfig.game.g_knockback,
        expected: '1000',
      };
    }

    if (demoConfig.game.g_speed !== '320') {
      valid = false;
      errors.g_speed = {
        actual: demoConfig.game.g_speed,
        expected: '320',
      };
    }

    if (demoConfig.game.pmove_msec !== '8') {
      valid = false;
      errors.pmove_msec = {
        actual: demoConfig.game.pmove_msec,
        expected: '8',
      };
    }

    if (demoConfig.game.sv_cheats !== '0') {
      valid = false;
      errors.sv_cheats = {
        actual: demoConfig.game.sv_cheats,
        expected: '0',
      };
    }

    if (demoConfig.game.timescale !== '1') {
      valid = false;
      errors.timescale = {
        actual: demoConfig.game.timescale,
        expected: '1',
      };
    }

    if (demoConfig.game.defrag_obs === '1') {
      warnings.push('killobs 0');
    }

    return {
      valid,
      errors,
      warnings,
    };
  }
}
