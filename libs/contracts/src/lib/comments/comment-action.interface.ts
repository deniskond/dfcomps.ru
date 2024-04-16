import { CommentInterface } from '../news/comments.interface';
import { CommentActionResult } from './comment-action-result.enum';

export interface CommentActionResultInterface {
  result: CommentActionResult;
  comments: CommentInterface[];
}
