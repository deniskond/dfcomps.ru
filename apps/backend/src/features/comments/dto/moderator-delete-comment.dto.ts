import { IsNotEmpty } from 'class-validator';

export class ModeratorDeleteCommentDto {
  @IsNotEmpty()
  commentId: number;

  @IsNotEmpty()
  reason: string;
}
