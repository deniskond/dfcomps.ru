import { transformNumber } from '@dfcomps/helpers';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class AddCommentDto {
  @IsNotEmpty()
  text: string;

  @IsNumber()
  @Transform(transformNumber)
  newsId: number;
}
