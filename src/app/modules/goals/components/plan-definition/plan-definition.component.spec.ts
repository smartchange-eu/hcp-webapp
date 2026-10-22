import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanDefinitionComponent } from './plan-definition.component';

describe('PlanDefinitionComponent', () => {
  let component: PlanDefinitionComponent;
  let fixture: ComponentFixture<PlanDefinitionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlanDefinitionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanDefinitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
