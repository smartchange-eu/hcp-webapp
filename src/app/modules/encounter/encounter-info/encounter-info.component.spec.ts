import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EncounterInfoComponent } from './encounter-info.component';

describe('EncounterInfoComponent', () => {
  let component: EncounterInfoComponent;
  let fixture: ComponentFixture<EncounterInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EncounterInfoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EncounterInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
