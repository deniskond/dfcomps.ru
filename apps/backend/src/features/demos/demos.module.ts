import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DemosController } from './demos.controller';
import { DemosService } from './demos.service';

@Module({
  imports: [TypeOrmModule.forFeature([])],
  controllers: [DemosController],
  providers: [DemosService],
})
export class DemosModule {}
