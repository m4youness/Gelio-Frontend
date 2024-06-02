import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiUrl } from '../enviroment/ApiUrl';
import { Person } from '../models/people';

@Injectable({
  providedIn: 'root',
})
export class PersonService {
  constructor(private http: HttpClient) {}
  private ApiUrl = ApiUrl;

  AddPerson(Person: Person): Observable<number> {
    return this.http.post<number>(this.ApiUrl + 'Person', Person);
  }

  GetPerson(PersonId?: number | null): Observable<Person> {
    return this.http.get<Person>(this.ApiUrl + `Person/${PersonId}`);
  }
}
