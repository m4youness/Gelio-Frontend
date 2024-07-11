import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-overlay2',
  templateUrl: './overlay2.component.html',
  styleUrl: './overlay2.component.css',
})
export class Overlay2Component {
  @Input() showOverlay: boolean = false; // Define input property
}
