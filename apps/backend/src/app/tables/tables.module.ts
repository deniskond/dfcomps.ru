import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TablesController } from './tables.controller';
import { TablesService } from './tables.service';
import { User } from '../auth/entities/user.entity';
import { OneVOneRating } from './entities/1v1-rating.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, OneVOneRating])],
  controllers: [TablesController],
  providers: [TablesService],
})
export class TablesModule {}
