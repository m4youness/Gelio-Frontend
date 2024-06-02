import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';
import { PersonService } from '../../services/person.service';
import { Person } from '../../models/people';
import { CountryService } from '../../services/country.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  constructor(
    private user_service: UserService,
    private person_service: PersonService,
    private country_service: CountryService,
  ) {}

  pageName: string = 'home';

  CurrentUser: User = {};
  CurrentPerson: Person = {};
  Country?: string | null;
  Age?: number | null;
  Gender?: string | null;

  ngOnInit(): void {
    this.getCurrentUser();
  }

  async getCurrentUser() {
    try {
      const userId = await this.user_service.CurrentUserId().toPromise();
      const User = await this.user_service.GetUser(userId).toPromise();
      if (User != null) {
        this.CurrentUser = User;
      }

      this.getCurrentPerson();
    } catch (err) {
      console.log(err);
    }
  }

  async getCurrentPerson() {
    try {
      const Person = await this.person_service
        .GetPerson(this.CurrentUser.PersonID)
        .toPromise();

      if (Person != null) {
        this.CurrentPerson = Person;
      }

      if (!this.CurrentPerson.CountryID) return;
      this.Country = await this.country_service
        .GetCountryWithId(this.CurrentPerson.CountryID)
        .toPromise();

      if (this.CurrentPerson.DateOfBirth) {
        this.Age = this.CalculateAge(this.CurrentPerson.DateOfBirth);
      }

      if (this.CurrentPerson.GenderID) {
        this.Gender = this.CurrentPerson.GenderID == 0 ? 'Male' : 'Female';
      }
    } catch (err) {
      console.log(err);
    }
  }

  CalculateAge(DateOfBirth: string) {
    const today = new Date();

    const dob = new Date(DateOfBirth);
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    return age;
  }
}
