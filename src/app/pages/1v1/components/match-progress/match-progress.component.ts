import { PickbanPhases } from './../../enums/pickban-phases.enum';
import { Component, ChangeDetectionStrategy, OnInit, ChangeDetectorRef, Input } from '@angular/core';
import { PickbanMapInterface } from '../../interfaces/pickban-map.interface';

@Component({
    selector: 'app-match-progress',
    templateUrl: './match-progress.component.html',
    styleUrls: ['./match-progress.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatchProgressComponent implements OnInit {
    @Input() pickbanPhase: PickbanPhases;

    public pickbanPhases = PickbanPhases;
    public mapList: PickbanMapInterface[] = [
        { name: 'abydos', isBannedByPlayer: false, isBannedByOpponent: false, isPickedByOpponent: false, isPickedByPlayer: false },
        { name: 'amaranth', isBannedByPlayer: false, isBannedByOpponent: false, isPickedByOpponent: false, isPickedByPlayer: false },
        { name: 'countach', isBannedByPlayer: false, isBannedByOpponent: false, isPickedByOpponent: false, isPickedByPlayer: false },
        { name: 'enigma', isBannedByPlayer: false, isBannedByOpponent: false, isPickedByOpponent: false, isPickedByPlayer: false },
        { name: 'medieva', isBannedByPlayer: false, isBannedByOpponent: false, isPickedByOpponent: false, isPickedByPlayer: false },
    ];
    public pickedMapName: string;

    constructor(private changeDetectorRef: ChangeDetectorRef) {}

    ngOnInit(): void {
        setTimeout(() => {
            this.banRandomAvailableMap();
            this.setPickbanPhaseAfterBan();
            this.pickbanPhase = PickbanPhases.YOU_ARE_BANNING;
            this.changeDetectorRef.markForCheck();
        }, 5000);
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
        this.mapList = this.mapList.map((originalMap: PickbanMapInterface) =>
            originalMap.name === mapName ? { ...originalMap, isBannedByPlayer: true } : originalMap,
        );
        this.setPickbanPhaseAfterBan();

        if (this.pickbanPhase === PickbanPhases.PICK_BANS_FINISHED) {
            return;
        }
    }

    private banRandomAvailableMap(): void {
        const availableMaps = this.mapList.filter(({ isBannedByPlayer, isBannedByOpponent }: PickbanMapInterface) => !isBannedByPlayer && !isBannedByOpponent);
        const randomAvailableMap = availableMaps[Math.floor(Math.random() * availableMaps.length)];

        this.mapList = this.mapList.map((map: PickbanMapInterface) => (map.name === randomAvailableMap.name ? { ...map, isBannedByOpponent: true } : map));
    }

    private setPickbanPhaseAfterBan(): void {
        const availableMaps = this.mapList.filter(({ isBannedByPlayer, isBannedByOpponent }: PickbanMapInterface) => !isBannedByPlayer && !isBannedByOpponent);

        if (availableMaps.length === 1) {
            this.pickedMapName = availableMaps[0].name;
            this.mapList = this.mapList.map((map: PickbanMapInterface) =>
                !map.isBannedByPlayer && !map.isBannedByOpponent ? { ...map, isPickedByPlayer: true, isPickedByOpponent: true } : map,
            );

            return;
        }
    }
}
