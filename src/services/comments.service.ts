import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Comments } from '../models/comments';
import { ApiUrl } from '../enviroment/ApiUrl';

@Injectable({
  providedIn: 'root',
})
export class CommentsService {
  constructor(private http: HttpClient) {}
  private apiUrl = ApiUrl;

  GetComments(postId?: number | null): Observable<Comments[]> {
    return this.http.get<Comments[]>(this.apiUrl + `Comments/${postId}`, {
      withCredentials: true,
    });
  }

  AddComment(comment: Comments): Observable<boolean> {
    return this.http.post<boolean>(
      this.apiUrl + 'Comment',
      {
        PostId: comment.PostId,
        UserId: comment.UserId,
        Message: comment.Message,
        CreatedDate: comment.CreatedDate,
      },
      { withCredentials: true },
    );
  }
}
