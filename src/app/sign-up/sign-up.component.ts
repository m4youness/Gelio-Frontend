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
import { firstValueFrom } from 'rxjs';
import { CloudinaryService } from '../../services/cloudinary.service';

import { NgxImageCompressService } from 'ngx-image-compress';

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
    private cloudinaryService: CloudinaryService,
    private imageCompress: NgxImageCompressService,
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

  file: File | null = null;
  loading: boolean = false;

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

  async ngOnInit() {
    try {
      const Countries: Country[] = await firstValueFrom(
        this.country_service.GetCountries(),
      );

      if (Countries) this.Countries = Countries;
    } catch (err) {
      console.log(err);
    }
  }

  async SignUp() {
    try {
      if (!this.SignUpForm.valid) {
        this.SignUpForm.markAllAsTouched();
        return;
      }

      this.person.CountryID = await firstValueFrom(
        this.country_service.GetCountryWithName(
          this.SignUpForm.controls['CountryName'].value,
        ),
      );

      const UserExists = await firstValueFrom(
        this.user_service.DoesUserExist({
          UserName: this.user.Username,
        }),
      );

      if (UserExists) {
        alert('This user already exists');
        return;
      }

      const PersonId = await firstValueFrom(
        this.person_service.AddPerson(this.person),
      );
      this.AddUser(PersonId);
    } catch (err) {
      console.log(err);
    }
  }

  async AddUser(PersonId?: number | null) {
    this.loading = true;

    if (this.file) {
      const ImageId = await firstValueFrom(
        this.cloudinaryService.uploadImage(this.file),
      );
      this.user.ProfileImageId = ImageId;
    }

    this.user.PersonID = PersonId;
    try {
      const UserId = await firstValueFrom(this.user_service.AddUser(this.user));
      if (!UserId) {
        alert('An error occurred');
        return;
      }

      const LoggedIn = await firstValueFrom(
        this.user_service.Login({
          UserName: this.user.Username,
          Password: this.user.Password,
        }),
      );

      if (LoggedIn) {
        this.loading = false;
        this.router.navigate(['/home']);
      }
    } catch (err) {
      console.log(err);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;

        this.imageCompress
          .compressFile(
            base64String,
            -1, // orientation
            70, // compress quality (0-100)
            150, // max width
            150, // max height
          )
          .then((result: string) => {
            const byteString = atob(result.split(',')[1]);
            const arrayBuffer = new ArrayBuffer(byteString.length);
            const int8Array = new Uint8Array(arrayBuffer);
            for (let i = 0; i < byteString.length; i++) {
              int8Array[i] = byteString.charCodeAt(i);
            }
            const blob = new Blob([int8Array], { type: 'image/jpeg' });
            this.file = new File([blob], file.name, { type: 'image/jpeg' });
          });
      };
      reader.readAsDataURL(file);
    }
  }
}
