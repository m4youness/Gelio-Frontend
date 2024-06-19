import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  pageName: string = 'home';

  Numbers: number[] = [1, 2, 3, 4, 5, 6];
}
