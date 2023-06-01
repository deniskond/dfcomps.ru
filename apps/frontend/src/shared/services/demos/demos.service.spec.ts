import { TestBed } from '@angular/core/testing';

import { DemosService } from './demos.service';

describe('DemosService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DemosService = TestBed.get(DemosService);
    expect(service).toBeTruthy();
  });
});
