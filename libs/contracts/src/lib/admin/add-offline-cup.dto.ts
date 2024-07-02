import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty } from 'class-validator';
import { transformBoolean, transformNumber } from '@dfcomps/helpers';

export class AddOfflineCupDto {
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

  @IsNotEmpty()
  mapLevelshotLink: string;

  @IsNotEmpty()
  mapPk3Link: string;

  @IsBoolean()
  @Transform(transformBoolean)
  isCustomMap: boolean;

  @Transform(transformNumber)
  multicupId: number | undefined;
}
