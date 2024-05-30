import { IsNotEmpty } from 'class-validator';

export class MapSuggestionDto {
  @IsNotEmpty()
  mapName: string;
}
