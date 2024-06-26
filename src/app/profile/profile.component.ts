import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';
import { PersonService } from '../../services/person.service';
import { Person } from '../../models/people';
import { CountryService } from '../../services/country.service';
import { firstValueFrom } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { DateUtilService } from '../../services/date-util.service';

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
    private date_util_service: DateUtilService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  id?: number | null;
  loggedInId?: number | null;

  pageName: string = 'messages';

  CurrentUser: User = {};
  CurrentPerson: Person = {};

  Country?: string | null;
  Age?: number | null;
  Gender?: string | null;
  UserId?: number | null;

  async ngOnInit() {
    try {
      this.loggedInId = await firstValueFrom(this.user_service.CurrentUserId());
    } catch (err) {
      console.log(err);
    }
    this.getCurrentUser();
  }

  async MakeUserInActive() {
    try {
      const UserId = await firstValueFrom(this.user_service.CurrentUserId());
      const InActive: Boolean = await firstValueFrom(
        this.user_service.MakeUserInActive(UserId),
      );

      if (InActive) {
        const LoggedOut = await firstValueFrom(this.user_service.Logout());
        if (LoggedOut) {
          this.router.navigate(['/']);
        }
      }
    } catch (err) {
      console.log(err);
    }
  }

  getCurrentUser() {
    try {
      this.route.paramMap.subscribe(
        async (params) => {
          this.id = +params.get('id')!;

          const User = await firstValueFrom(this.user_service.GetUser(this.id));

          if (!User) return;

          this.CurrentUser = User;

          this.getCurrentPerson();
        },
        (err) => {
          console.log(err);
        },
      );
    } catch (err) {
      console.log(err);
    }
  }

  async getCurrentPerson() {
    try {
      if (!this.CurrentUser.PersonID) return;
      const Person = await firstValueFrom(
        this.person_service.GetPerson(this.CurrentUser.PersonID),
      );

      if (!Person) return;

      this.CurrentPerson = Person;

      if (!this.CurrentPerson.CountryID) return;

      this.Country = await firstValueFrom(
        this.country_service.GetCountryWithId(this.CurrentPerson.CountryID),
      );

      if (this.CurrentPerson.DateOfBirth) {
        this.Age = this.date_util_service.calculateAge(
          this.CurrentPerson.DateOfBirth,
        );
      }

      if (this.CurrentPerson.GenderID) {
        this.Gender = this.CurrentPerson.GenderID == 0 ? 'Male' : 'Female';
      }
    } catch (err) {
      console.log(err);
    }
  }
}
