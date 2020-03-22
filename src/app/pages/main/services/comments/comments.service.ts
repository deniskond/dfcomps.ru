import { URL_PARAMS } from '../../../../configs/url-params.config';
import { CommentInterface } from '../../../../interfaces/comments.interface';
import { BackendService } from '../../../../services/backend-service/backend-service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommentActionResultInterface } from './interfaces/comment-action.interface';

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
}
