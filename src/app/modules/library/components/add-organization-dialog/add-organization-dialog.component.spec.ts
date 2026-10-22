import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddOrganizationDialogComponent } from './add-organization-dialog.component';

describe('AddOrganizationDialogComponent', () => {
  let component: AddOrganizationDialogComponent;
  let fixture: ComponentFixture<AddOrganizationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddOrganizationDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddOrganizationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
