import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty } from 'class-validator';

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
  @IsNotEmpty()
  @Transform(({ value} ) => value === 'true')
  addNews: boolean;

  @IsNotEmpty()
  size: string;

  @IsNotEmpty()
  mapLevelshotLink: string;

  @IsNotEmpty()
  mapPk3Link: string;

  multicupId: number | undefined;
}
