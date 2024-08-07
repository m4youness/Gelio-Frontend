import { Component, Input } from '@angular/core';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Image } from '../../models/image';
import { CloudinaryService } from '../../services/cloudinary.service';

@Component({
  selector: 'app-fixed-navbar',
  templateUrl: './fixed-navbar.component.html',
  styleUrl: './fixed-navbar.component.css',
})
export class FixedNavbarComponent {
  @Input() PageName?: string | null;

  constructor(
    private user_service: UserService,
    private cloudinary_service: CloudinaryService,
    private router: Router,
  ) {}

  rotationAngle: number = 0;
  CurrentUser: User = {};
  ProfilePicture: Image = {};
  loading: boolean = false;

  NavigationPopup: boolean = false;

  OpenPopup() {
    this.NavigationPopup = !this.NavigationPopup;
    this.rotationAngle = this.rotationAngle === 0 ? 90 : 0;
  }

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

      if (!this.CurrentUser.ProfileImageId) {
        return;
      }

      if (this.CurrentUser.ProfileImageId == 2) {
        const ProfileUrl =
          'https://res.cloudinary.com/geliobackend/image/upload/v1720033720/profile-icon-design-free-vector.jpg.jpg';

        this.ProfilePicture = {
          Url: ProfileUrl,
        };
        return;
      }

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
      this.loading = true;
      await firstValueFrom(this.user_service.Logout());
      this.router.navigate(['/']);
      this.loading = false;
    } catch (err) {
      console.log(err);
    }
  }
}
