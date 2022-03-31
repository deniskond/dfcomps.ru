import { TestBed } from '@angular/core/testing';
import { MoviesService } from './movies.service';
import { mock, instance } from 'ts-mockito';

describe('MoviesService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [{ provide: MoviesService, useFactory: () => instance(mock(MoviesService)) }],
    }),
  );

  it('should be created', () => {
    const service: MoviesService = TestBed.get(MoviesService);
    expect(service).toBeTruthy();
  });
});
