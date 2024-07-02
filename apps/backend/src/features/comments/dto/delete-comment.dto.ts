import { transformNumber } from '@dfcomps/helpers';
import { Transform } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class DeleteCommentDto {
  @IsNumber()
  @Transform(transformNumber)
  commentId: number;
}
