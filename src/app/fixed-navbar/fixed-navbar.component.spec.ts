import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FixedNavbarComponent } from './fixed-navbar.component';

describe('FixedNavbarComponent', () => {
  let component: FixedNavbarComponent;
  let fixture: ComponentFixture<FixedNavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FixedNavbarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FixedNavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
