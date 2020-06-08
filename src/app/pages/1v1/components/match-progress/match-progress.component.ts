import { UserInterface } from './../../../../interfaces/user.interface';
import { PickbanPhases } from './../../enums/pickban-phases.enum';
import { Component, ChangeDetectionStrategy, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { PickbanMapInterface } from '../../interfaces/pickban-map.interface';
import { MatchInterface } from '../../services/interfaces/match.interface';
import { PickbanMapServerInterface } from '../../services/interfaces/pickban-map-server.interface';

@Component({
    selector: 'app-match-progress',
    templateUrl: './match-progress.component.html',
    styleUrls: ['./match-progress.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatchProgressComponent implements OnChanges {
    @Input() match: MatchInterface;
    @Input() user: UserInterface;

    @Output() mapBanned = new EventEmitter<string>();

    public pickbanPhase: PickbanPhases;
    public pickbanPhases = PickbanPhases;
    public mapList: PickbanMapInterface[] = [];
    public pickedMapName: string;

    ngOnChanges({ match }: SimpleChanges): void {
        if (match && this.match) {
            this.calculateBanPhaseByMatchInfo();
            this.updateMaplistByMatchInfo();
            this.updatePickedMapNameByMatchInfo();
        }
    }

    public getPickbanPhaseCaption(pickbanPhase: PickbanPhases): string {
        const pickbanPhaseCaptionMap: Record<PickbanPhases, string> = {
            [PickbanPhases.OPPONENT_IS_BANNING]: 'Opponent is banning a map',
            [PickbanPhases.YOU_ARE_BANNING]: 'You are banning a map',
            [PickbanPhases.PICK_BANS_FINISHED]: 'Upload a demo when ready',
        };

        return pickbanPhaseCaptionMap[pickbanPhase];
    }

    public onMapBanned(mapName: string): void {
        this.mapBanned.emit(mapName);
    }

    private banRandomAvailableMap(): void {
        const availableMaps = this.mapList.filter(({ isBannedByPlayer, isBannedByOpponent }: PickbanMapInterface) => !isBannedByPlayer && !isBannedByOpponent);
        const randomAvailableMap = availableMaps[Math.floor(Math.random() * availableMaps.length)];

        this.mapList = this.mapList.map((map: PickbanMapInterface) => (map.name === randomAvailableMap.name ? { ...map, isBannedByOpponent: true } : map));
    }

    private calculateBanPhaseByMatchInfo(): void {
        if (!this.match.isFirstPlayerBanning && !this.match.isSecondPlayerBanning) {
            this.pickbanPhase = PickbanPhases.PICK_BANS_FINISHED;

            return;
        }

        if (
            (this.match.firstPlayerId === this.user.id && this.match.isFirstPlayerBanning) ||
            (this.match.secondPlayerId === this.user.id && this.match.isSecondPlayerBanning)
        ) {
            this.pickbanPhase = PickbanPhases.YOU_ARE_BANNING;

            return;
        }

        this.pickbanPhase = PickbanPhases.OPPONENT_IS_BANNING;
    }

    private updateMaplistByMatchInfo(): void {
        this.mapList = this.match.maps.map((map: PickbanMapServerInterface) => {
            const isFirstPlayer = this.user.id === this.match.firstPlayerId;

            return {
                name: map.name,
                isBannedByPlayer: isFirstPlayer ? map.isBannedByFirstPlayer : map.isBannedBySecondPlayer,
                isBannedByOpponent: isFirstPlayer ? map.isBannedBySecondPlayer : map.isBannedByFirstPlayer,
                isPickedByPlayer: isFirstPlayer ? map.isPickedByFirstPlayer : map.isPickedBySecondPlayer,
                isPickedByOpponent: isFirstPlayer ? map.isPickedBySecondPlayer : map.isPickedByFirstPlayer,
            };
        });
    }

    private updatePickedMapNameByMatchInfo(): void {
        const pickedMap = this.match.maps.find(
            (pickbanMap: PickbanMapServerInterface) => pickbanMap.isPickedByFirstPlayer && pickbanMap.isPickedBySecondPlayer,
        );

        if (pickedMap) {
            this.pickedMapName = pickedMap.name;
        }
    }
}
