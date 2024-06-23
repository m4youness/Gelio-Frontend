import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.css',
})
export class SignInComponent implements OnInit {
  constructor(
    private user_service: UserService,
    private router: Router,
  ) {
    this.SignInForm = new FormGroup({
      username: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
    });
  }

  ngOnInit(): void {
    this.GetCurrentUser();
  }

  SignInForm: FormGroup;

  username?: string | null;
  password?: string | null;

  async GetCurrentUser() {
    try {
      const UserId = await firstValueFrom(this.user_service.CurrentUserId());
      if (UserId) this.router.navigate(['/home']);
    } catch (err) {
      console.log(err);
    }
  }

  async Login() {
    if (!this.SignInForm.valid) {
      this.SignInForm.markAllAsTouched();
      return;
    }
    try {
      console.log(this.username);
      const IsActive: Boolean = await firstValueFrom(
        this.user_service.IsNotActive(this.username),
      );

      if (!IsActive) {
        alert('This user is not active');
        return;
      }

      const LoggedIn: boolean = await firstValueFrom(
        this.user_service.Login({
          UserName: this.username,
          Password: this.password,
        }),
      );

      if (LoggedIn) {
        this.router.navigate(['/home']);
      } else {
        this.SignInForm.markAllAsTouched();
      }
    } catch (err) {
      console.log(err);
    }
  }
}
