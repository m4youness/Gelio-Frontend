import { Component, Input, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Image } from '../../models/image';
import { CloudinaryService } from '../../services/cloudinary.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit {
  @Input() PageName?: string | null;

  constructor(
    private user_service: UserService,
    private cloudinary_service: CloudinaryService,
    private router: Router,
  ) {}

  CurrentUser: User = {};
  ProfilePicture: Image = {};

  ngOnInit(): void {
    this.GetCurrentUser();
  }

  GoToUserProfile() {
    this.router.navigate(['/profile', this.CurrentUser.UserId]);
  }

  async GetCurrentUser() {
    try {
      const UserId = await firstValueFrom(this.user_service.CurrentUserId());
      const user: User = await firstValueFrom(
        this.user_service.GetUser(UserId),
      );

      if (!user) {
        this.router.navigate(['/error']);
        return;
      }

      this.CurrentUser = user;

      if (!this.CurrentUser.ProfileImageId) return;
      this.ProfilePicture = await firstValueFrom(
        this.cloudinary_service.findImage(this.CurrentUser.ProfileImageId),
      );
    } catch (err) {
      this.router.navigate(['/error']);
      console.log(err);
    }
  }

  async Logout() {
    try {
      const LoggedOut: boolean = await firstValueFrom(
        this.user_service.Logout(),
      );

      if (LoggedOut) this.router.navigate(['/']);
    } catch (err) {
      console.log(err);
    }
  }
}
