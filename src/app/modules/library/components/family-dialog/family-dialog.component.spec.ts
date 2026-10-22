import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FamilyDialogComponent } from './family-dialog.component';

describe('FamilyDialogComponent', () => {
  let component: FamilyDialogComponent;
  let fixture: ComponentFixture<FamilyDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FamilyDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FamilyDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
