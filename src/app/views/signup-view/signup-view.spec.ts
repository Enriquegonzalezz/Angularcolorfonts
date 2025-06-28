import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignupView } from './signup-view';

describe('SignupView', () => {
  let component: SignupView;
  let fixture: ComponentFixture<SignupView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignupView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignupView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
