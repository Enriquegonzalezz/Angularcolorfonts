import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FontsViewComponent } from './fonts-view';

describe('FontsViewComponent', () => {
  let component: FontsViewComponent;
  let fixture: ComponentFixture<FontsViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FontsView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FontsView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
