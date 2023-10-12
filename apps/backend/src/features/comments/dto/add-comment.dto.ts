import { IsNotEmpty } from 'class-validator';

export class AddCommentDto {
  @IsNotEmpty()
  text: string;

  @IsNotEmpty()
  newsId: number;
}
