import { Physics } from './../../enums/physics.enum';
import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { MatchStates } from './enums/match-states.enum';

@Component({
    templateUrl: './1v1.page.html',
    styleUrls: ['./1v1.page.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OneVOnePageComponent {
    public matchState = MatchStates.WAITNG_FOR_QUEUE;
    public matchStates = MatchStates;
    public physics = Physics;
    public selectedPhysics: Physics;

    constructor(private changeDetectorRef: ChangeDetectorRef) {}

    public joinQueue(physics: Physics): void {
        this.selectedPhysics = physics;
        this.matchState = MatchStates.IN_QUEUE;

        setTimeout(() => {
            this.matchState = MatchStates.MATCH_IN_PROGRESS;
            this.changeDetectorRef.markForCheck();
        }, 5000);
    }

    public leaveQueue(): void {
        this.matchState = MatchStates.WAITNG_FOR_QUEUE;
    }
}
