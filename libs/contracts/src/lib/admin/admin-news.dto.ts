import { IsEnum, IsNotEmpty } from 'class-validator';
import { NewsTypes } from '../news/news-types.enum';
import { transformNumber } from '@dfcomps/helpers';
import { Transform } from 'class-transformer';

export class AdminNewsDto {
  @IsNotEmpty()
  russianTitle: string;

  @IsNotEmpty()
  englishTitle: string;

  @IsNotEmpty()
  postingTime: string;

  russianText: string | null;

  englishText: string | null;

  imageLink: string | null;

  @IsEnum(NewsTypes)
  type: NewsTypes;

  @IsNotEmpty()
  streams: string;

  youtube?: string;

  @Transform(transformNumber)
  cupId?: number;

  @Transform(transformNumber)
  multicupId?: number;
}
