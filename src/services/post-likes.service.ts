import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiUrl } from '../enviroment/ApiUrl';

@Injectable({
  providedIn: 'root',
})
export class PostLikesService {
  constructor(private http: HttpClient) {}
  private apiUrl = ApiUrl;

  AddLike(postId: number, userId: number): Observable<boolean> {
    return this.http.post<boolean>(
      this.apiUrl + 'Post/Like',
      { PostId: postId, UserId: userId },
      { withCredentials: true },
    );
  }

  RemoveLike(postId: number, userId: number): Observable<boolean> {
    return this.http.post<boolean>(
      this.apiUrl + 'Like/Delete',
      { PostId: postId, UserId: userId },
      { withCredentials: true },
    );
  }

  IsPostLiked(postId: number, userId: number): Observable<boolean> {
    return this.http.post<boolean>(
      this.apiUrl + 'Is/Post/Liked',
      { PostId: postId, UserId: userId },
      { withCredentials: true },
    );
  }

  GetAmountOfLikes(postId: number): Observable<number> {
    return this.http.get<number>(this.apiUrl + `Likes/${postId}`, {
      withCredentials: true,
    });
  }
}
