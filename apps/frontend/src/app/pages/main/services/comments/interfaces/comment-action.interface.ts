import { CommentActionResult } from '../enums/comment-action-result.enum';
import { CommentInterface } from '../../../../../interfaces/comments.interface';

export interface CommentActionResultInterface {
  result: CommentActionResult;
  comments: CommentInterface[];
}
