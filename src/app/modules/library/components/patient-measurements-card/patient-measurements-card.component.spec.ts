import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientMeasurementsCardComponent } from './patient-measurements-card.component';

describe('PatientMeasurementsCardComponent', () => {
  let component: PatientMeasurementsCardComponent;
  let fixture: ComponentFixture<PatientMeasurementsCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientMeasurementsCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientMeasurementsCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
