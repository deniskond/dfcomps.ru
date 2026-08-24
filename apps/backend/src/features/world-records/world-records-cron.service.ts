import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as moment from 'moment';
import { WorldRecord } from '../../shared/entities/world-record.entity';
import { LoggerService } from '../../shared/services/logger.service';

@Injectable()
export class WorldRecordsCronService {
  constructor(
    @InjectRepository(WorldRecord) private readonly worldRecordRepository: Repository<WorldRecord>,
    private readonly loggerService: LoggerService,
  ) {}

  @Cron('00 03 * * 1', { timeZone: 'Europe/Moscow' })
  async cleanupOldWorldRecords(): Promise<void> {
    const oneMonthAgo = moment().subtract(1, 'month').toDate();

    const subQuery = this.worldRecordRepository
      .createQueryBuilder()
      .subQuery()
      .select('MIN(sub.time)')
      .from(WorldRecord, 'sub')
      .where('sub.map = wr.map')
      .andWhere('sub.physics = wr.physics')
      .getQuery();

    // Find the records that are not the best time and that are more than one month old
    const oldRecords: WorldRecord[] = await this.worldRecordRepository
      .createQueryBuilder('wr')
      .where(`wr.time > (${subQuery})`)
      .andWhere('wr.uploaded_at < :cutoff', { cutoff: oneMonthAgo })
      .getMany();

    if (!oldRecords.length) {
      return;
    }

    this.loggerService.info(`WR cron: deleting ${oldRecords.length} old records that are not the best time`);

    for (const record of oldRecords) {
      const demoFilePath = process.env.DFCOMPS_FILES_ABSOLUTE_PATH + `/${record.demopath}`;

      if (fs.existsSync(demoFilePath)) {
        fs.rmSync(demoFilePath);
      }

      await this.worldRecordRepository
        .createQueryBuilder()
        .delete()
        .from(WorldRecord)
        .where({ id: record.id })
        .execute();
    }

    this.loggerService.info(`WR cron: cleanup complete`);
  }
}
