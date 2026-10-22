import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InitialRiskCardComponent } from './initial-risk-card.component';

describe('InitialRiskCardComponent', () => {
  let component: InitialRiskCardComponent;
  let fixture: ComponentFixture<InitialRiskCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InitialRiskCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InitialRiskCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
