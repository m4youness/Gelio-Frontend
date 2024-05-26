import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  constructor(private user_service: UserService) {}

  CurrentUser: User = {};

  ngOnInit(): void {
    this.GetCurrentUser();
  }

  GetCurrentUser() {
    this.user_service.CurrentUserId().subscribe(
      (data) => {
        this.user_service.GetUser(data).subscribe((data) => {
          this.CurrentUser = data;
        });
      },
      (err) => {
        console.log(err);
      },
    );
  }
}
