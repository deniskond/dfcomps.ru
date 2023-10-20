import { Module } from '@nestjs/common';
import { AdminNewsModule } from './news/admin-news.module';
import { AdminCupsModule } from './cups/admin-cups.module';

@Module({
  imports: [AdminNewsModule, AdminCupsModule],
})
export class AdminModule {}
