import { IsEnum, IsNotEmpty } from 'class-validator';
import { Physics } from '../global/physics.enum';

export class OnlineCupActionDto {
  @IsNotEmpty()
  fullName: string;

  @IsNotEmpty()
  shortName: string;

  @IsNotEmpty()
  startTime: string;

  @IsNotEmpty()
  useTwoServers: boolean;

  @IsNotEmpty()
  server1: string;

  @IsEnum(Physics)
  @IsNotEmpty()
  physics: Physics;

  server2: string | undefined;
}
