import { transformBoolean, transformNumber } from '@dfcomps/helpers';
import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateOfflineCupDto {
  @IsNotEmpty()
  fullName: string;

  @IsNotEmpty()
  shortName: string;

  @IsNotEmpty()
  startTime: string;

  @IsNotEmpty()
  endTime: string;

  @IsNotEmpty()
  mapName: string;

  @IsNotEmpty()
  mapAuthor: string;

  @IsNotEmpty()
  weapons: string;

  @IsBoolean()
  @Transform(transformBoolean)
  addNews: boolean;

  @IsNotEmpty()
  size: string;

  @IsBoolean()
  @Transform(transformBoolean)
  isCustomMap: boolean;

  mapLevelshotLink: string | undefined;

  mapPk3Link: string | undefined;

  @Transform(transformNumber)
  multicupId?: number;
}
