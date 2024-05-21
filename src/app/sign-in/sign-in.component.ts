import { Component } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.css',
})
export class SignInComponent {
  constructor(
    private user_service: UserService,
    private router: Router,
  ) {}
  username: string = '';
  password: string = '';

  Login() {
    this.user_service
      .Login({ UserName: this.username, Password: this.password })
      .subscribe((data) => {
        if (data) {
          this.router.navigate(['/home']);
        } else {
          alert('wrong username or password');
        }
      });
  }
}
