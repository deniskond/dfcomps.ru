import { TestBed } from '@angular/core/testing';
import { NewsService } from './news.service';
import { instance, mock } from 'ts-mockito';

describe('NewsService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [{ provide: NewsService, useFactory: () => instance(mock(NewsService)) }],
    }),
  );

  it('should be created', () => {
    const service: NewsService = TestBed.get(NewsService);
    expect(service).toBeTruthy();
  });
});
