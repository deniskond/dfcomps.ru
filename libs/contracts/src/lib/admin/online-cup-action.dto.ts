import { IsBoolean, IsEnum, IsNotEmpty } from 'class-validator';
import { Physics } from '../global/physics.enum';
import { Transform } from 'class-transformer';
import { transformBoolean } from '@dfcomps/helpers';

export class OnlineCupActionDto {
  @IsNotEmpty()
  fullName: string;

  @IsNotEmpty()
  shortName: string;

  @IsNotEmpty()
  startTime: string;

  @IsBoolean()
  @Transform(transformBoolean)
  useTwoServers: boolean;

  @IsNotEmpty()
  server1: string;

  @IsEnum(Physics)
  physics: Physics;

  server2: string | undefined;
}
