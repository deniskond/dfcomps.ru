import { ValidationDialogComponent } from './../../../main/components/news-offline-start/validation-dialog/validation-dialog.component';
import { UploadDemoDtoInterface } from './../../../../services/demos/dto/upload-demo.dto';
import { DemosService } from './../../../../services/demos/demos.service';
import { LanguageService } from './../../../../services/language/language.service';
import { UserInterface } from './../../../../interfaces/user.interface';
import { PickbanPhases } from './../../enums/pickban-phases.enum';
import { Component, ChangeDetectionStrategy, Input, OnChanges, SimpleChanges, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { PickbanMapInterface } from '../../interfaces/pickban-map.interface';
import { MatchInterface } from '../../services/interfaces/match.interface';
import { PickbanMapServerInterface } from '../../services/interfaces/pickban-map-server.interface';
import { take, finalize, catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { DuelPlayersInfoInterface } from '../../interfaces/duel-players-info.interface';

@Component({
    selector: 'app-match-progress',
    templateUrl: './match-progress.component.html',
    styleUrls: ['./match-progress.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatchProgressComponent implements OnChanges {
    @Input() match: MatchInterface;
    @Input() user: UserInterface;
    @Input() playersInfo: DuelPlayersInfoInterface;

    @Output() mapBanned = new EventEmitter<string>();

    @ViewChild('fileInput') fileInput: ElementRef;

    public pickbanPhase: PickbanPhases;
    public pickbanPhases = PickbanPhases;
    public mapList: PickbanMapInterface[] = [];
    public pickedMapName: string;
    public isUploading = false;
    public bestDemoTime: number;
    public playerRating: number;
    public playerNick: string;
    public playerCountry: string;
    public opponentRating: number;
    public opponentNick: string;
    public opponentCountry: string;

    constructor(private languageService: LanguageService, private snackBar: MatSnackBar, private demosService: DemosService, private dialog: MatDialog) {}

    ngOnChanges({ match, playersInfo }: SimpleChanges): void {
        if (match && this.match) {
            this.calculateBanPhaseByMatchInfo();
            this.updateMaplistByMatchInfo();
            this.updatePickedMapNameByMatchInfo();
        }

        if (playersInfo) {
            this.updatePlayersInfo();
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

    public openFileDialog(): void {
        this.fileInput.nativeElement.click();
    }

    public uploadDemo(): void {
        const demo: File = this.fileInput.nativeElement.files[0];

        if (!demo) {
            return;
        }

        if (!demo.name.toLowerCase().includes(this.pickedMapName.toLowerCase())) {
            this.openSnackBar('error', 'wrongMap');

            return;
        }

        this.isUploading = true;

        this.demosService
            .uploadDuelDemo$(demo)
            .pipe(
                finalize(() => {
                    this.fileInput.nativeElement.value = null;
                    this.isUploading = false;
                }),
                catchError(() => {
                    this.openSnackBar('error', 'uploadFailed');

                    return of();
                }),
            )
            .subscribe(({ status, validation, message }: UploadDemoDtoInterface) => {
                if (status === 'Success') {
                    this.openSnackBar('success', 'demoSent');
                    this.bestDemoTime = +message;
                } else if (status === 'Error') {
                    this.openSnackBar('error', message, false);
                } else if (status === 'Invalid') {
                    this.dialog.open(ValidationDialogComponent, {
                        data: validation,
                    });
                }
            });
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

    private openSnackBar(title: string, message: string, needMessageTranslation = true): void {
        this.languageService
            .getTranslations$()
            .pipe(take(1))
            .subscribe((translations: Record<string, string>) => {
                const snackBarMessage = needMessageTranslation ? translations[message] : message;

                this.snackBar.open(translations[title], snackBarMessage, { duration: 3000 });
            });
    }

    private updatePlayersInfo(): void {
        if (this.user.id === this.playersInfo.firstPlayerId) {
            this.playerNick = this.playersInfo.firstPlayerInfo.nick;
            this.playerRating = +this.playersInfo.firstPlayerInfo.rating || 1500;
            this.playerCountry = this.playersInfo.firstPlayerInfo.country;
            this.opponentNick = this.playersInfo.secondPlayerInfo.nick;
            this.opponentRating = +this.playersInfo.secondPlayerInfo.rating || 1500;
            this.opponentCountry = this.playersInfo.secondPlayerInfo.country;
        } else {
            this.opponentNick = this.playersInfo.firstPlayerInfo.nick;
            this.opponentRating = +this.playersInfo.firstPlayerInfo.rating || 1500;
            this.opponentCountry = this.playersInfo.firstPlayerInfo.country;
            this.playerNick = this.playersInfo.secondPlayerInfo.nick;
            this.playerRating = +this.playersInfo.secondPlayerInfo.rating || 1500;
            this.playerCountry = this.playersInfo.secondPlayerInfo.country;
        }
    }
}
