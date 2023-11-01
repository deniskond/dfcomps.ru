import { IsNotEmpty } from 'class-validator';

export class DemoDeleteDto {
  @IsNotEmpty()
  cupId: number;

  @IsNotEmpty()
  demoName: string;
}
