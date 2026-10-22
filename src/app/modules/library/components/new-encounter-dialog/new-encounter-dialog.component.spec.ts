import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewEncounterDialogComponent } from './new-encounter-dialog.component';

describe('NewEncounterDialogComponent', () => {
  let component: NewEncounterDialogComponent;
  let fixture: ComponentFixture<NewEncounterDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewEncounterDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewEncounterDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
