import { IsNotEmpty } from 'class-validator';

export class OnlineCupActionDto {
  @IsNotEmpty()
  fullName: string;

  @IsNotEmpty()
  shortName: string;

  @IsNotEmpty()
  startTime: string;

  @IsNotEmpty()
  addNews: boolean;

  @IsNotEmpty()
  useTwoServers: boolean;

  @IsNotEmpty()
  server1: string;

  server2: string | undefined;
}
