import { BackendService, URL_PARAMS } from '~shared/rest-api';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommentActionResultInterface } from './interfaces/comment-action.interface';
import { CommentInterface } from '~shared/interfaces/comments.interface';

@Injectable({
  providedIn: 'root',
})
export class CommentsService extends BackendService {
  public sendComment$(text: string, newsId: string): Observable<CommentInterface[]> {
    return this.post$(URL_PARAMS.COMMENTS.ADD, {
      text,
      newsId,
    });
  }

  public deleteComment$(commentId: string): Observable<CommentActionResultInterface> {
    return this.post$(URL_PARAMS.COMMENTS.DELETE, {
      commentId,
    });
  }

  public updateComment$(text: string, commentId: string): Observable<CommentActionResultInterface> {
    return this.post$(URL_PARAMS.COMMENTS.UPDATE, {
      text,
      commentId,
    });
  }

  public adminDeleteComment$(commentId: string, reason: string): Observable<CommentInterface[]> {
    return this.post$(URL_PARAMS.COMMENTS.ADMIN_DELETE, {
      commentId,
      reason,
    });
  }
}
