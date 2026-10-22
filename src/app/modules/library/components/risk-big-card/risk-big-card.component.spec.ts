import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiskBigCardComponent } from './risk-big-card.component';

describe('RiskBigCardComponent', () => {
  let component: RiskBigCardComponent;
  let fixture: ComponentFixture<RiskBigCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RiskBigCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RiskBigCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
