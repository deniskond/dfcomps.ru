import { ArrayMaxSize, IsArray, IsString } from 'class-validator';

export class AnticheatDemoSourcesDto {
  @IsArray()
  @ArrayMaxSize(1000)
  @IsString({ each: true })
  demoIds: string[];
}
