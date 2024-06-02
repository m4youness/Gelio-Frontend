import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Country } from '../models/country';
import { ApiUrl } from '../enviroment/ApiUrl';

@Injectable({
  providedIn: 'root',
})
export class CountryService {
  private ApiUrl = ApiUrl;

  constructor(private http: HttpClient) {}

  GetCountries(): Observable<Country[]> {
    return this.http.get<Country[]>(this.ApiUrl + 'Countries');
  }

  GetCountryWithName(countryName: string): Observable<number> {
    return this.http.post<number>(this.ApiUrl + 'GetCountryWithName', {
      CountryName: countryName,
    });
  }

  GetCountryWithId(countryId: number): Observable<string> {
    return this.http.get<string>(this.ApiUrl + `Country/${countryId}`);
  }
}
