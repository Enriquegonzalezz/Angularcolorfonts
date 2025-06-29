import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatatableView } from './datatable-view';

describe('DatatableView', () => {
  let component: DatatableView;
  let fixture: ComponentFixture<DatatableView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatatableView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DatatableView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
