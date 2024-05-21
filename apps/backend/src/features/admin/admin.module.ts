import { Module } from '@nestjs/common';
import { AdminNewsModule } from './news/admin-news.module';
import { AdminCupsModule } from './cups/admin-cups.module';
import { AdminMulticupsModule } from './multicups/admin-multicups.module';
import { AdminSeasonModule } from './season/admin-season.module';

@Module({
  imports: [AdminNewsModule, AdminCupsModule, AdminMulticupsModule, AdminSeasonModule],
})
export class AdminModule {}
