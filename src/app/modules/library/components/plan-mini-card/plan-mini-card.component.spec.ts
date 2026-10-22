import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanMiniCardComponent } from './plan-mini-card.component';

describe('PlanMiniCardComponent', () => {
  let component: PlanMiniCardComponent;
  let fixture: ComponentFixture<PlanMiniCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlanMiniCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanMiniCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
