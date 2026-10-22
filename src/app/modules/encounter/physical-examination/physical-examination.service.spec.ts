import { TestBed } from '@angular/core/testing';

import { PhysicalExaminationService } from './physical-examination.service';

describe('PhysicalExaminationService', () => {
  let service: PhysicalExaminationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PhysicalExaminationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
