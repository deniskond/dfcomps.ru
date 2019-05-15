import { TestBed } from '@angular/core/testing';
import { ProfileService } from './profile.service';
import { instance, mock } from 'ts-mockito';

describe('ProfileService', () => {
    beforeEach(() => TestBed.configureTestingModule({
        providers: [{ provide: ProfileService, useFactory: () => instance(mock(ProfileService)) }],
    }));

    it('should be created', () => {
        const service: ProfileService = TestBed.get(ProfileService);
        expect(service).toBeTruthy();
    });
});
