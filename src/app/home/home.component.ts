import { Component } from '@angular/core';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  constructor(private user_service: UserService) {}

  IsLoggedIn() {
    this.user_service.IsLoggedIn().subscribe((data) => {
      if (data) {
        alert('logged in');
      } else {
        alert('not logged in');
      }
    });
  }
}
