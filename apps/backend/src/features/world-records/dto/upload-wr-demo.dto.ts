import { transformNumber } from '@dfcomps/helpers';
import { Transform } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export enum WrPlayerType {
  MY_DEMO = 'MY_DEMO',
  DFCOMPS_USER = 'DFCOMPS_USER',
  DF_NAME = 'DF_NAME',
}

export class UploadWrDemoDto {
  @IsEnum(WrPlayerType)
  playerType: WrPlayerType;

  @IsNumber()
  @Transform(transformNumber)
  @IsOptional()
  userId?: number;
}
