import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPractitionerComponent } from './add-practitioner.component';

describe('AddPractitionerComponent', () => {
  let component: AddPractitionerComponent;
  let fixture: ComponentFixture<AddPractitionerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddPractitionerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddPractitionerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
