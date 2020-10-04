import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayerCellComponent } from './player-cell.component';

describe('PlayerCellComponent', () => {
    let component: PlayerCellComponent;
    let fixture: ComponentFixture<PlayerCellComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [PlayerCellComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PlayerCellComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
