import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiUrl } from '../enviroment/ApiUrl';
import { User } from '../models/user';

class LoginClass {
  UserName?: string | null;
  Password?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient) {}
  private ApiUrl: string = ApiUrl;

  Login(LoginInfo: LoginClass): Observable<boolean> {
    return this.http.post<boolean>(this.ApiUrl + 'SignIn', LoginInfo, {
      withCredentials: true,
    });
  }

  MakeUserInActive(UserId: number): Observable<Boolean> {
    return this.http.get<Boolean>(this.ApiUrl + `User/InActive/${UserId}`, {
      withCredentials: true,
    });
  }

  Logout(): Observable<boolean> {
    return this.http.get<boolean>(this.ApiUrl + 'Logout', {
      withCredentials: true,
    });
  }

  AddUser(User: User): Observable<number> {
    return this.http.post<number>(this.ApiUrl + 'User', User, {
      withCredentials: true,
    });
  }

  CurrentUserId(): Observable<number> {
    return this.http.get<number>(this.ApiUrl + 'UserId', {
      withCredentials: true,
    });
  }

  GetUser(id: number): Observable<User> {
    return this.http.get<User>(this.ApiUrl + `User/${id}`, {
      withCredentials: true,
    });
  }

  DoesUserExist(Login: LoginClass): Observable<boolean> {
    return this.http.post<boolean>(this.ApiUrl + 'User/Exists', Login);
  }

  IsNotActive(username: string): Observable<Boolean> {
    return this.http.get<Boolean>(this.ApiUrl + `User/IsNotActive/${username}`);
  }
}
