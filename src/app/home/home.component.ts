import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Emitters } from '../emitters/emitter';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  constructor(private user_service: UserService) {}

  IsLoggedIn() {
    this.user_service.IsLoggedIn().subscribe(
      (data) => {
        if (data) {
          alert('logged in');
        }
      },
      (err) => {
        console.log(err);
      },
    );
  }
  ngOnInit(): void {
    Emitters.authEmitter.subscribe((auth) => {
      alert(auth);
    });
  }

  Logout() {
    this.user_service.Logout().subscribe(
      (data) => {
        if (data) {
          Emitters.authEmitter.emit(false);
        }
      },
      (err) => {
        console.log(err);
      },
    );
  }
}
