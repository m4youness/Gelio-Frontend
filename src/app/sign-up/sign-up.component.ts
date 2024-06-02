import { Component, OnInit } from '@angular/core';
import { PersonService } from '../../services/person.service';
import { Person } from '../../models/people';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';
import { formatDate } from '@angular/common';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CountryService } from '../../services/country.service';
import { Country } from '../../models/country';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css',
})
export class SignUpComponent implements OnInit {
  constructor(
    private person_service: PersonService,
    private user_service: UserService,
    private country_service: CountryService,
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
      CountryName: new FormControl('', [Validators.required]),
    });
  }

  SignUpForm: FormGroup;
  currentDate: string = formatDate(new Date(), 'yyyy-MM-dd', 'en-US');
  Countries: Country[] = [];

  person: Person = { GenderID: 0 };
  user: User = {
    CreatedDate: this.currentDate,
    IsActive: true,
    ProfileImageId: 1,
  };

  MakeMale() {
    this.person.GenderID = 0;
  }

  MakeFemale() {
    this.person.GenderID = 1;
  }

  ngOnInit(): void {
    this.country_service.GetCountries().subscribe(
      (data) => {
        this.Countries = data;
      },
      (err) => {
        console.log(err);
      },
    );
  }

  async SignUp() {
    try {
      if (this.SignUpForm.valid) {
        this.person.CountryID = await this.country_service
          .GetCountryWithName(this.SignUpForm.controls['CountryName'].value)
          .toPromise();
        this.user_service
          .DoesUserExist({
            UserName: this.user.Username,
          })
          .subscribe((data) => {
            if (!data) {
              this.person_service.AddPerson(this.person).subscribe(
                (data) => {
                  this.AddUser(data);
                },
                (err) => {
                  console.log(err);
                },
              );
            } else {
              alert('This user already exists');
            }
          });
      } else {
        this.SignUpForm.markAllAsTouched();
      }
    } catch (err) {
      console.log(err);
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
              },
            );
        }
      },
      (err) => {
        console.log(err);
      },
    );
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const filePath = file.name; // This gives you the file name
      console.log('File Path:', filePath);
    }
  }
}
