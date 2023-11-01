import { IsNotEmpty } from 'class-validator';

export class UpdateCommentDto {
  @IsNotEmpty()
  commentId: number;

  @IsNotEmpty()
  text: string;
}
