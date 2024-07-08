import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  templateUrl: './unauthorized.component.html',
  styleUrl: './unauthorized.component.css',
})
export class UnauthorizedComponent implements OnInit {
  constructor(
    private user_service: UserService,
    private router: Router,
  ) {}

  async ngOnInit() {
    try {
      const UserId = await firstValueFrom(this.user_service.CurrentUserId());
      if (UserId) this.router.navigate(['/home']);
    } catch (err) {
      console.log(err);
    }
  }
}
