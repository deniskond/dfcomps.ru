import { IsNotEmpty } from 'class-validator';
import { Physics } from '../physics.enum';

export class GetTop10Dto {
  @IsNotEmpty()
  physics: Physics;

  @IsNotEmpty()
  mode: '1v1' | 'classic';
}
