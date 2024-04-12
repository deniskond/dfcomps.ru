import { Transform } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

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
  @Transform(({ value }) => value === 'true')
  addNews: string | boolean;

  @IsNotEmpty()
  size: string;

  @IsNotEmpty()
  mapLevelshotLink: string;

  @IsNotEmpty()
  mapPk3Link: string;

  multicupId: number | undefined;
}
