import { Module } from '@nestjs/common';
import { AdminNewsModule } from './news/admin-news.module';

@Module({
  imports: [AdminNewsModule],
})
export class AdminModule {}
