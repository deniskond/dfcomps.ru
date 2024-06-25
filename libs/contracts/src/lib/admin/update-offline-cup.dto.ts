import { Transform } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

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

  @IsNotEmpty()
  addNews: boolean;

  @IsNotEmpty()
  size: string;

  @IsNotEmpty()
  @Transform(({ value }) => value === 'true')
  isCustomMap: boolean;

  mapLevelshotLink: string | undefined;

  mapPk3Link: string | undefined;

  multicupId?: number;
}
