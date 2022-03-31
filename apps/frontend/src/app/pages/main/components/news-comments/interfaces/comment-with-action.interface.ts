import { CommentInterface } from '../../../../../interfaces/comments.interface';

export interface CommentWithActionInterface extends CommentInterface {
  isEditable: boolean;
  isAdminDeletable: boolean;
}
