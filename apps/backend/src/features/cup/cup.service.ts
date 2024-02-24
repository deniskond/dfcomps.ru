import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CheckCupRegistrationInterface,
  CupInterface,
  Physics,
  ResultsTableInterface,
  ValidDemoInterface,
  ArchiveLinkInterface,
} from '@dfcomps/contracts';
import { AuthService } from '../auth/auth.service';
import * as moment from 'moment';
import { Cup } from '../../shared/entities/cup.entity';
import { CupResult } from '../../shared/entities/cup-result.entity';
import { UserAccessInterface } from '../../shared/interfaces/user-access.interface';
import { mapCupEntityToInterface } from '../../shared/mappers/cup.mapper';
import { UserRoles, checkUserRoles } from '@dfcomps/auth';
import { TablesService } from '../tables/tables.service';
import * as Zip from 'adm-zip';
import * as fs from 'fs';
import { CupDemo } from '../../shared/entities/cup-demo.entity';
import { v4 } from 'uuid';

@Injectable()
export class CupService {
  constructor(
    @InjectRepository(Cup) private readonly cupRepository: Repository<Cup>,
    @InjectRepository(CupResult) private readonly cupResultRepository: Repository<CupResult>,
    @InjectRepository(CupDemo) private readonly cupDemosRepository: Repository<CupDemo>,
    private readonly authService: AuthService,
    private readonly tablesService: TablesService,
  ) {}

  public async getNextCupInfo(accessToken: string | undefined): Promise<CupInterface> {
    const userAccess: UserAccessInterface = await this.authService.getUserInfoByAccessToken(accessToken);
    const nextCup: Cup = await this.getNextCup();
    let serverInfo: CupResult | null = null;

    if (userAccess.userId) {
      serverInfo = await this.cupResultRepository
        .createQueryBuilder('cups_results')
        .select('server')
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
    const zip = new Zip();
    const validationArchiveFileName = `${cupName}_all_demos_validation.zip`;
    const validationArchiveFilePath =
      process.env.DFCOMPS_FILES_ABSOLUTE_PATH + `/demos/cup${cupId}/${validationArchiveFileName}`;

    if (fs.existsSync(validationArchiveFilePath)) {
      fs.rmSync(validationArchiveFilePath);
    }

    const allCupDemos: CupDemo[] = await this.cupDemosRepository
      .createQueryBuilder('cups_demos')
      .where('cups_demos.cupId = :cupId', { cupId })
      .getMany();

    allCupDemos.forEach((demo: CupDemo) => {
      const isVq3TableDemo = vq3Table.valid.some((vq3Demo: ValidDemoInterface) => vq3Demo.demopath === demo.demopath);

      if (isVq3TableDemo) {
        zip.addLocalFile(process.env.DFCOMPS_FILES_ABSOLUTE_PATH + `/demos/cup${cupId}/${demo.demopath}`, 'vq3');

        return;
      }

      const isCpmTableDemo = cpmTable.valid.some((cpmDemo: ValidDemoInterface) => cpmDemo.demopath === demo.demopath);

      if (isCpmTableDemo) {
        zip.addLocalFile(process.env.DFCOMPS_FILES_ABSOLUTE_PATH + `/demos/cup${cupId}/${demo.demopath}`, 'cpm');

        return;
      }

      zip.addLocalFile(process.env.DFCOMPS_FILES_ABSOLUTE_PATH + `/demos/cup${cupId}/${demo.demopath}`, 'bonus');
    });

    zip.writeZip(validationArchiveFilePath);

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
    const zip = new Zip();
    const streamersArchiveFileName = `${cupName}_streamers_demos_${v4().substring(0, 12)}.zip`;
    const streamersArchiveFilePath =
      process.env.DFCOMPS_FILES_ABSOLUTE_PATH + `/demos/cup${cupId}/${streamersArchiveFileName}`;

    if (fs.existsSync(streamersArchiveFilePath)) {
      fs.rmSync(streamersArchiveFilePath);
    }

    let cpmDemosCount = 0;
    let vq3DemosCount = 0;

    for (let vq3DemoIndex = 0; vq3DemoIndex < vq3Table.valid.length; vq3DemoIndex++) {
      zip.addLocalFile(
        process.env.DFCOMPS_FILES_ABSOLUTE_PATH + `/demos/cup${cupId}/${vq3Table.valid[vq3DemoIndex].demopath}`,
        'vq3',
        this.formatNumberWithLeadingZeroes(vq3DemoIndex + 1) + '.dm_68',
      );
      vq3DemosCount++;
    }

    for (let cpmDemoIndex = 0; cpmDemoIndex < vq3Table.valid.length; cpmDemoIndex++) {
      zip.addLocalFile(
        process.env.DFCOMPS_FILES_ABSOLUTE_PATH + `/demos/cup${cupId}/${cpmTable.valid[cpmDemoIndex].demopath}`,
        'cpm',
        this.formatNumberWithLeadingZeroes(cpmDemoIndex + 1) + '.dm_68',
      );
      cpmDemosCount++;
    }

    zip.writeZip(streamersArchiveFilePath);

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
