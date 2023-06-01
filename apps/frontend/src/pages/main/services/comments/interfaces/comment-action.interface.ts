import { CommentInterface } from '~shared/interfaces/comments.interface';
import { CommentActionResult } from '../enums/comment-action-result.enum';

export interface CommentActionResultInterface {
  result: CommentActionResult;
  comments: CommentInterface[];
}
