import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Overlay2Component } from './overlay2.component';

describe('Overlay2Component', () => {
  let component: Overlay2Component;
  let fixture: ComponentFixture<Overlay2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Overlay2Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Overlay2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
