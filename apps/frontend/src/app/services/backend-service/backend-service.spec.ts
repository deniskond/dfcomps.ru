import { TestBed } from '@angular/core/testing';
import { mock, instance } from 'ts-mockito';
import { BackendService } from './backend-service';

describe('BackendService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [{ provide: BackendService, useFactory: () => instance(mock(BackendService)) }],
    }),
  );

  it('should be created', () => {
    const service: BackendService = TestBed.get(BackendService);
    expect(service).toBeTruthy();
  });
});
