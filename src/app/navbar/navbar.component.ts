import { Component, Input, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit {
  @Input() PageName?: string | null;

  constructor(
    private user_service: UserService,
    private router: Router,
  ) {}
  authenticated = false;
  CurrentUser: User = {};

  ngOnInit(): void {
    this.GetCurrentUser();
  }

  GetCurrentUser() {
    this.user_service.CurrentUserId().subscribe(
      (data) => {
        this.user_service.GetUser(data).subscribe(
          (data) => {
            if (data == null) {
              this.router.navigate(['/error']);
              return;
            }
            this.CurrentUser = data;
          },
          (err) => {
            console.log(err);
          },
        );
      },
      (err) => {
        console.log(err);
        this.router.navigate(['/error']);
      },
    );
  }

  Logout() {
    this.user_service.Logout().subscribe(
      (data) => {
        if (data) {
          this.router.navigate(['/']);
        }
      },
      (err) => {
        console.log(err);
      },
    );
  }
}
