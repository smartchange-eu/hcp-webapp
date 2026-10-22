import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HealthHistoryComponent } from './health-history.component';

describe('AnamnFamComponent', () => {
  let component: HealthHistoryComponent;
  let fixture: ComponentFixture<HealthHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HealthHistoryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HealthHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
