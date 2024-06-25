import { Transform } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';
import { transformBoolean } from '@dfcomps/helpers';

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

  @IsNotEmpty()
  @Transform(transformBoolean)
  addNews: boolean;

  @IsNotEmpty()
  size: string;

  @IsNotEmpty()
  mapLevelshotLink: string;

  @IsNotEmpty()
  mapPk3Link: string;

  @IsNotEmpty()
  @Transform(transformBoolean)
  isCustomMap: boolean;

  multicupId: number | undefined;
}
