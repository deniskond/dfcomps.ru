import { TestBed } from '@angular/core/testing';
import { CupRegistrationService } from './cup-registration.service';

describe('CupRegistrationService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CupRegistrationService = TestBed.get(CupRegistrationService);
    expect(service).toBeTruthy();
  });
});
