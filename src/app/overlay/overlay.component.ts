import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-overlay',
  templateUrl: './overlay.component.html',
  styleUrl: './overlay.component.css',
})
export class OverlayComponent {
  @Input() showOverlay: boolean = false; // Define input property
}
