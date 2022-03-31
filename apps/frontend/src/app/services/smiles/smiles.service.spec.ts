import { TestBed } from '@angular/core/testing';
import { SmilesService } from './smiles.service';

describe('SmilesService', () => {
  let service: SmilesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SmilesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
