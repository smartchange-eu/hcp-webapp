import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NutritionBarchartComponent } from './nutrition-barchart.component';

describe('NutritionBarchartComponent', () => {
  let component: NutritionBarchartComponent;
  let fixture: ComponentFixture<NutritionBarchartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NutritionBarchartComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NutritionBarchartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
