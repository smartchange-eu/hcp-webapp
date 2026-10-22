import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientNutritionCardComponent } from './patient-nutrition-card.component';

describe('PatientNutritionCardComponent', () => {
  let component: PatientNutritionCardComponent;
  let fixture: ComponentFixture<PatientNutritionCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientNutritionCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientNutritionCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
