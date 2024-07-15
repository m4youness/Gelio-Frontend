import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';
import { PersonService } from '../../services/person.service';
import { Person } from '../../models/people';
import { CountryService } from '../../services/country.service';
import { firstValueFrom } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { DateUtilService } from '../../services/date-util.service';
import { CloudinaryService } from '../../services/cloudinary.service';
import { NgxImageCompressService } from 'ngx-image-compress';
import { Country } from '../../models/country';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  constructor(
    private user_service: UserService,
    private person_service: PersonService,
    private country_service: CountryService,
    private date_util_service: DateUtilService,
    private cloudinary_service: CloudinaryService,
    private imageCompress: NgxImageCompressService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.profileForm = new FormGroup({
      firstname: new FormControl('', [Validators.required]),
      lastname: new FormControl('', [Validators.required]),
      username: new FormControl('', [Validators.required]),
      phonenumber: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      country: new FormControl('', [Validators.required]),
    });
  }

  id?: number | null;
  loggedInId?: number | null;

  pageName: string = 'messages';

  CurrentUser: User = {};
  CurrentPerson: Person = {};

  Fullname?: string | null;

  Country?: string | null;
  Age?: number | null;
  Gender?: string | null;

  EditProfile: boolean = false;
  EditProfileLoading: boolean = false;

  ProfilePicture?: string | null;
  file?: File | null = null;

  Countries: Country[] = [];

  updateLoading: boolean = false;

  EditUserProfile() {
    this.EditProfile = true;
  }

  CloseEditProfile() {
    this.EditProfile = false;
  }

  MakeMale() {
    this.CurrentPerson.GenderID = 0;
  }

  MakeFemale() {
    this.CurrentPerson.GenderID = 1;
  }

  async ngOnInit() {
    try {
      const [loggedinId, countries] = await Promise.all([
        firstValueFrom(this.user_service.CurrentUserId()),
        firstValueFrom(this.country_service.GetCountries()),
      ]);
      this.loggedInId = loggedinId;
      this.Countries = countries;
    } catch (err) {
      console.log(err);
    }
    this.getCurrentUser();
  }

  async deactivateAccount() {
    try {
      const UserId = await firstValueFrom(this.user_service.CurrentUserId());
      await firstValueFrom(this.user_service.MakeUserInActive(UserId));
      await firstValueFrom(this.user_service.Logout());

      this.router.navigate(['/']);
    } catch (err) {
      console.log(err);
    }
  }

  getCurrentUser() {
    try {
      this.route.paramMap.subscribe(async (params) => {
        this.id = +params.get('id')!;

        this.CurrentUser = await firstValueFrom(
          this.user_service.GetUser(this.id),
        );

        await this.getCurrentPerson();

        this.setFormValues(this.CurrentPerson, this.CurrentUser);
      });
    } catch (err) {
      console.log(err);
    }
  }

  async setFormValues(person: Person, user: User) {
    this.profileForm.controls['firstname'].setValue(person.FirstName);
    this.profileForm.controls['lastname'].setValue(person.LastName);

    this.profileForm.controls['email'].setValue(person.Email);

    this.profileForm.controls['phonenumber'].setValue(person.PhoneNumber);
    this.profileForm.controls['username'].setValue(user.Username);

    if (!person.CountryID) {
      return;
    }

    const country = await firstValueFrom(
      this.country_service.GetCountryWithId(person.CountryID),
    );
    this.profileForm.controls['country'].setValue(country);
  }

  async getCurrentPerson() {
    try {
      if (!this.CurrentUser.PersonID) return;
      this.CurrentPerson = await firstValueFrom(
        this.person_service.GetPerson(this.CurrentUser.PersonID),
      );

      this.Fullname =
        this.CurrentPerson.FirstName + ' ' + this.CurrentPerson.LastName;

      if (!this.CurrentPerson.CountryID) {
        return;
      }

      if (this.CurrentPerson.DateOfBirth) {
        this.Age = this.date_util_service.calculateAge(
          this.CurrentPerson.DateOfBirth,
        );
      }

      this.Gender = this.CurrentPerson.GenderID == 0 ? 'Male' : 'Female';

      this.Country = await firstValueFrom(
        this.country_service.GetCountryWithId(this.CurrentPerson.CountryID),
      );
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

  async UpdateUser() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    const username = this.profileForm.controls['username'].value;
    const firstname = this.profileForm.controls['firstname'].value;
    const lastname = this.profileForm.controls['lastname'].value;
    const phonenumber = this.profileForm.controls['phonenumber'].value;
    const countryName = this.profileForm.controls['country'].value;

    try {
      this.updateLoading = true;
      const countryId = await firstValueFrom(
        this.country_service.GetCountryWithName(countryName),
      );

      const email = this.profileForm.controls['email'].value;
      var ProfileImageId = this.CurrentUser.ProfileImageId;

      if (this.file) {
        ProfileImageId = await firstValueFrom(
          this.cloudinary_service.uploadImage(this.file),
        );
      }

      const user = new User(this.CurrentUser.UserId, username, ProfileImageId);
      const person = new Person(
        this.CurrentPerson.PersonID,
        firstname,
        lastname,
        this.CurrentPerson.GenderID,
        phonenumber,
        email,
        countryId,
      );

      await firstValueFrom(this.user_service.UpdateUser(user, person));
      this.updateLoading = false;
      this.EditProfile = false;
      this.getCurrentUser();
    } catch (err) {
      console.log(err);
    }
  }
}
