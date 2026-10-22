import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HcpHomeComponent } from './hcp-home.component';

describe('HcpHomeComponent', () => {
  let component: HcpHomeComponent;
  let fixture: ComponentFixture<HcpHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HcpHomeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HcpHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
