import { CommentInterface } from "~shared/interfaces/comments.interface";

export interface CommentWithActionInterface extends CommentInterface {
  isEditable: boolean;
  isAdminDeletable: boolean;
}
