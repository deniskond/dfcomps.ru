import { transformNumber } from '@dfcomps/helpers';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateCommentDto {
  @IsNumber()
  @Transform(transformNumber)
  commentId: number;

  @IsNotEmpty()
  text: string;
}
