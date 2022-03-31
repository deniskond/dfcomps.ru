import { TestBed } from '@angular/core/testing';
import { mock, instance } from 'ts-mockito';
import { RatingTablesService } from './rating-tables-service';

describe('RatingTablesService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [{ provide: RatingTablesService, useFactory: () => instance(mock(RatingTablesService)) }],
    }),
  );

  it('should be created', () => {
    const service: RatingTablesService = TestBed.get(RatingTablesService);
    expect(service).toBeTruthy();
  });
});
