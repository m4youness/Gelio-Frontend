import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';
import { PersonService } from '../../services/person.service';
import { Person } from '../../models/people';
import { CountryService } from '../../services/country.service';
import { firstValueFrom } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { CloudinaryService } from '../../services/cloudinary.service';

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
    private cloudinary_service: CloudinaryService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  id?: number | null;
  loggedInId?: number | null;

  pageName: string = 'home';

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
