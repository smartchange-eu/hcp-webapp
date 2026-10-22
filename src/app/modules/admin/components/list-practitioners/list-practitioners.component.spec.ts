import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListPractitionersComponent } from './list-practitioners.component';

describe('ListPractitionersComponent', () => {
  let component: ListPractitionersComponent;
  let fixture: ComponentFixture<ListPractitionersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListPractitionersComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListPractitionersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
