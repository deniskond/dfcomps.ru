import { IsEnum, IsNotEmpty } from 'class-validator';
import { ArchiveNewsFilter } from './archive-news-filter.enum';

export class NewsArchiveFilterDto {
  @IsNotEmpty()
  startIndex: number;

  @IsNotEmpty()
  endIndex: number;

  @IsNotEmpty()
  @IsEnum(ArchiveNewsFilter)
  filter: ArchiveNewsFilter;
}
