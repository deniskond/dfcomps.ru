import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayerDemosDialogComponent } from './player-demos-dialog.component';

describe('PlayerDemosDialogComponent', () => {
    let component: PlayerDemosDialogComponent;
    let fixture: ComponentFixture<PlayerDemosDialogComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [PlayerDemosDialogComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PlayerDemosDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
