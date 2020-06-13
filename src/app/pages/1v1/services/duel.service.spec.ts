import { TestBed } from '@angular/core/testing';

import { DuelService } from './duel.service';

describe('DuelService', () => {
    let service: DuelService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(DuelService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
