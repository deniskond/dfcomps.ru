import { IsNotEmpty } from 'class-validator';

export class AddCupDto {
  @IsNotEmpty()
  fullName: string;

  @IsNotEmpty()
  shortName: string;

  @IsNotEmpty()
  startTime: string;

  @IsNotEmpty()
  endTime: string;

  @IsNotEmpty()
  multicupId: number;

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
  mapLevelshotLink: string;

  @IsNotEmpty()
  mapPk3Link: string;
}
