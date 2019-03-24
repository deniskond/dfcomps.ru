import { TestBed } from '@angular/core/testing';
import { CupTimerService } from './cup-timer.service';

describe('CupTimerService', () => {
    beforeEach(() => TestBed.configureTestingModule({
        providers: [CupTimerService],
    }));

    it('should be created', () => {
        const service: CupTimerService = TestBed.get(CupTimerService);

        expect(service).toBeTruthy();
    });
});
