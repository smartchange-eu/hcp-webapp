import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EncounterDashboardComponent } from './encounter-dashboard.component';

describe('EpisodeDashboardComponent', () => {
  let component: EncounterDashboardComponent;
  let fixture: ComponentFixture<EncounterDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EncounterDashboardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EncounterDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
