import { CommentInterface } from '@dfcomps/contracts';

export interface CommentWithActionInterface extends CommentInterface {
  isEditable: boolean;
  isModeratorDeletable: boolean;
}
