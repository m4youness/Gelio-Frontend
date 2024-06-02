import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';

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

  GetCurrentUser() {
    this.user_service.CurrentUserId().subscribe(
      (data) => {
        this.user_service.GetUser(data).subscribe((data) => {
          if (data != null) {
            this.router.navigate(['/home']);
            return;
          }
        });
      },
      (err) => {
        console.log(err);
      },
    );
  }

  Login() {
    if (this.SignInForm.valid) {
      this.user_service
        .Login({ UserName: this.username, Password: this.password })
        .subscribe(
          (data: boolean) => {
            if (data) {
              this.router.navigate(['/home']);
            } else {
              this.SignInForm.markAllAsTouched();
            }
          },
          (err) => {
            console.log(err);
          },
        );
    } else {
      this.SignInForm.markAllAsTouched();
    }
  }
}
