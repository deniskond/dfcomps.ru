import { IsEnum, IsNumber } from 'class-validator';
import { ArchiveNewsFilter } from './archive-news-filter.enum';
import { Transform } from 'class-transformer';
import { transformNumber } from '@dfcomps/helpers';

export class NewsArchiveFilterDto {
  @IsNumber()
  @Transform(transformNumber)
  startIndex: number;

  @IsNumber()
  @Transform(transformNumber)
  endIndex: number;

  @IsEnum(ArchiveNewsFilter)
  filter: ArchiveNewsFilter;
}
