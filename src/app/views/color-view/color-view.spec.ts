import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColorView } from './color-view';

describe('ColorView', () => {
  let component: ColorView;
  let fixture: ComponentFixture<ColorView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColorView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ColorView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
