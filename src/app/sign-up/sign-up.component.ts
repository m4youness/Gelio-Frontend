import { Component } from '@angular/core';
import { PersonService } from '../../services/person.service';
import { Person } from '../../models/people';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';
import { formatDate } from '@angular/common';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';

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
  ) {
    this.SignUpForm = new FormGroup({
      firstname: new FormControl('', [Validators.required]),
      lastname: new FormControl('', [Validators.required]),
      phonenumber: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.email, Validators.required]),
      dateofbirth: new FormControl('', [Validators.required]),
      username: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
    });
  }

  SignUpForm: FormGroup;
  currentDate: string = formatDate(new Date(), 'yyyy-MM-dd', 'en-US');

  person: Person = { GenderID: 0, CountryID: 118 };
  user: User = {
    CreatedDate: this.currentDate,
    IsActive: true,
    ProfileImage: '',
  };

  SignUp() {
    if (this.SignUpForm.valid) {
      this.user_service
        .DoesUserExist({
          UserName: this.user.Username,
        })
        .subscribe(
          (data) => {
            if (!data) {
              this.person_service.AddPerson(this.person).subscribe(
                (data) => {
                  console.log(data);
                  this.AddUser(data);
                },
                (err) => {
                  console.log(err);
                },
              );
            } else {
              alert('This user already exists');
            }
          },
          (err) => {
            console.log(err);
          },
        );
    } else {
      this.SignUpForm.markAllAsTouched();
    }
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
                }
              },
              (err) => {
                console.log(err);
                alert('err');
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
