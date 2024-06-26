import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiUrl } from '../enviroment/ApiUrl';
import { Image } from '../models/image';

@Injectable({
  providedIn: 'root',
})
export class CloudinaryService {
  constructor(private http: HttpClient) {}

  private apiUrl = ApiUrl;

  uploadImage(file: File): Observable<number> {
    const data = new FormData();
    data.append('image', file);
    return this.http.post<number>(this.apiUrl + 'Image', data);
  }

  findImage(imageId: number): Observable<Image> {
    return this.http.get<Image>(this.apiUrl + `Image/${imageId}`, {
      withCredentials: true,
    });
  }
}
