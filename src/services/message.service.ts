import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../models/user';
import { ApiUrl } from '../enviroment/ApiUrl';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private ApiUrl = ApiUrl;
  constructor(private http: HttpClient) {}

  LoadSentMessages(PersonId?: number | null): Observable<User[]> {
    return this.http.get<User[]>(this.ApiUrl + `LoadMessages/${PersonId}`);
  }
}
