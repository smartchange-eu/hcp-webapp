import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuggestionsListComponent } from './suggestions-list.component';

describe('SuggestionsListComponent', () => {
  let component: SuggestionsListComponent;
  let fixture: ComponentFixture<SuggestionsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SuggestionsListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuggestionsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
