import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

class LoginClass {
  UserName: string = '';
  Password: string = '';
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient) {}

  Login(LoginInfo: LoginClass): Observable<boolean> {
    return this.http.post<boolean>('http://localhost:3000/Login', LoginInfo);
  }

  IsLoggedIn(): Observable<boolean> {
    return this.http.get<boolean>('http://localhost:3000/IsLoggedIn');
  }
}
