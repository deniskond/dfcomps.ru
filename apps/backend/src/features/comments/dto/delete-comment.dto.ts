import { IsNotEmpty } from 'class-validator';

export class DeleteCommentDto {
  @IsNotEmpty()
  commentId: number;
}
