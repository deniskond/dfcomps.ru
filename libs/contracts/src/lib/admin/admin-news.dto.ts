import { IsEnum, IsNotEmpty } from 'class-validator';
import { NewsTypes } from '../news/news-types.enum';

export class AdminNewsDto {
  @IsNotEmpty()
  russianTitle: string;

  @IsNotEmpty()
  englishTitle: string;

  @IsNotEmpty()
  postingTime: string;

  russianText: string | null;

  englishText: string | null;

  @IsEnum(NewsTypes)
  @IsNotEmpty()
  type: NewsTypes;

  @IsNotEmpty()
  streams: string;

  youtube?: string;

  cupId?: number;

  multicupId?: number;
}
