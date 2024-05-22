import { Component } from '@angular/core';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'], // <-- Corrected property name
})
export class HomeComponent {
  constructor(private user_service: UserService) {}

  IsLoggedIn() {
    this.user_service.IsLoggedIn().subscribe(
      (data) => {
        if (data) {
          alert('logged in');
        }
      },
      (err) => {
        console.log(err); // <-- Corrected syntax
      },
    );
  }

  Logout() {
    this.user_service.Logout().subscribe(
      (data) => {
        if (data) {
          alert('Logged out');
        }
      },
      (err) => {
        console.log(err);
      },
    );
  }
}
