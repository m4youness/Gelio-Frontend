import { Component } from '@angular/core';
import { PersonService } from '../../services/person.service';
import { Person } from '../../models/people';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';
import { formatDate } from '@angular/common';
import { Router } from '@angular/router';
import { Emitters } from '../emitters/emitter';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css',
})
export class SignUpComponent {
  constructor(
    private person_service: PersonService,
    private user_service: UserService,
    private router: Router,
  ) {}

  currentDate: string = formatDate(new Date(), 'yyyy-MM-dd', 'en-US');

  person: Person = { GenderID: 0, CountryID: 118 };
  user: User = {
    CreatedDate: this.currentDate,
    IsActive: true,
    ProfileImage: '',
  };

  SignUp() {
    this.person_service.AddPerson(this.person).subscribe(
      (data) => {
        console.log(data);
        this.AddUser(data);
      },
      (err) => {
        console.log(err);
      },
    );
  }

  AddUser(PersonId: number) {
    this.user.PersonID = PersonId;
    this.user_service.AddUser(this.user).subscribe(
      (data) => {
        if (data == null) {
          alert('An error occurred');
        } else {
          this.user_service
            .Login({
              UserName: this.user.Username,
              Password: this.user.Password,
            })
            .subscribe(
              (data) => {
                if (data) {
                  this.router.navigate(['/home']);
                  Emitters.authEmitter.emit(true);
                }
              },
              (err) => {
                console.log(err);
              },
            );
        }
      },
      (err) => {
        console.log(err);
      },
    );
  }
}
