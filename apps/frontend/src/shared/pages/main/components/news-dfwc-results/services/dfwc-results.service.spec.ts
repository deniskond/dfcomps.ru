import { TestBed } from '@angular/core/testing';
import { DfwcResultsService } from './dfwc-results.service';

describe('DfwcResultsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DfwcResultsService = TestBed.get(DfwcResultsService);

    expect(service).toBeTruthy();
  });
});
