import { TestBed } from '@angular/core/testing';
import { CupTableService } from './cup-table.service';

describe('CupTableService', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it('should be created', () => {
        const service: CupTableService = TestBed.get(CupTableService);
        expect(service).toBeTruthy();
    });
});
