import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CupController } from './cup.controller';
import { Cup } from './entities/cup.entity';
import { CupService } from './cup.service';

@Module({
  imports: [TypeOrmModule.forFeature([Cup])],
  controllers: [CupController],
  providers: [CupService],
})
export class CupModule {}
