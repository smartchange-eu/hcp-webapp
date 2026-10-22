import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageOrgsComponent } from './manage-orgs.component';

describe('ManageOrgsComponent', () => {
  let component: ManageOrgsComponent;
  let fixture: ComponentFixture<ManageOrgsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageOrgsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageOrgsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
