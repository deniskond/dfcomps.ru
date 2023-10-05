import { CommentInterface } from '@dfcomps/contracts';
import { CommentActionResult } from '../enums/comment-action-result.enum';

export interface CommentActionResultInterface {
  result: CommentActionResult;
  comments: CommentInterface[];
}
