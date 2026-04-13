import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorldRecordsController } from './world-records.controller';
import { WorldRecordsService } from './world-records.service';
import { WorldRecordsCronService } from './world-records-cron.service';
import { WorldRecord } from '../../shared/entities/world-record.entity';
import { MapParsingService } from '../../shared/services/map-parsing.service';
import { LoggerService } from '../../shared/services/logger.service';

@Module({
  imports: [TypeOrmModule.forFeature([WorldRecord])],
  controllers: [WorldRecordsController],
  providers: [WorldRecordsService, WorldRecordsCronService, MapParsingService, LoggerService],
})
export class WorldRecordsModule {}
