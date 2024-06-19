import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiUrl } from '../enviroment/ApiUrl';

@Injectable({
  providedIn: 'root',
})
export class CloudinaryService {
  constructor(private http: HttpClient) {}
  private ApiUrl = ApiUrl;

  uploadImage(file: File): Observable<string> {
    const data = new FormData();
    data.append('image', file);
    return this.http.post<string>(this.ApiUrl + 'Image', data, {
      withCredentials: true,
    });
  }
}
