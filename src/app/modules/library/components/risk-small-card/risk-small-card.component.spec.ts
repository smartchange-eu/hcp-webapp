import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiskSmallCardComponent } from './risk-small-card.component';

describe('RiskSmallCardComponent', () => {
  let component: RiskSmallCardComponent;
  let fixture: ComponentFixture<RiskSmallCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RiskSmallCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RiskSmallCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
