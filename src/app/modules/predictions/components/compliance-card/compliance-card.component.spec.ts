import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplianceCardComponent } from './compliance-card.component';

describe('ComplianceCardComponent', () => {
  let component: ComplianceCardComponent;
  let fixture: ComponentFixture<ComplianceCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComplianceCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComplianceCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
