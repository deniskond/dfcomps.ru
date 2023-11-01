import { IsNotEmpty } from 'class-validator';

export class DemoUploadDto {
  @IsNotEmpty()
  cupId: number;

  @IsNotEmpty()
  mapName: string;
}
