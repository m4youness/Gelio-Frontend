import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Post } from '../models/post';
import { ApiUrl } from '../enviroment/ApiUrl';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  constructor(private http: HttpClient) {}
  private apiUrl = ApiUrl;

  GetPosts(UserId: number): Observable<Post[]> {
    return this.http.get<Post[]>(this.apiUrl + `Posts/${UserId}`, {
      withCredentials: true,
    });
  }

  UploadPost(post: Post): Observable<number> {
    return this.http.post<number>(
      this.apiUrl + 'Post',
      {
        Message: post.Body,
        UserId: post.UserId,
        CreatedDate: post.CreatedDate,
        ImageId: post.ImageId,
      },
      { withCredentials: true },
    );
  }
}
