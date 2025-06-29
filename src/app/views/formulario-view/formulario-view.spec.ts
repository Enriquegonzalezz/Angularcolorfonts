import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioView } from './formulario-view';

describe('FormularioView', () => {
  let component: FormularioView;
  let fixture: ComponentFixture<FormularioView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormularioView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
