import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientFamilyCardComponent } from './patient-family-card.component';

describe('PatientFamilyCardComponent', () => {
  let component: PatientFamilyCardComponent;
  let fixture: ComponentFixture<PatientFamilyCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientFamilyCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientFamilyCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
