import { NewsOfflineStartInterface } from '../../../../services/news-service/interfaces/news-offline-start.interface';
import { Component, Input, OnInit } from '@angular/core';
import { CupStates } from '../../../../enums/cup-states.enum';
import * as moment from 'moment';

@Component({
    selector: 'app-news-offline-start',
    templateUrl: './news-offline-start.component.html',
    styleUrls: ['./news-offline-start.component.less'],
})
export class NewsOfflineStartComponent implements OnInit {
    @Input()
    news: NewsOfflineStartInterface;

    public cupState: CupStates;
    public cupStates = CupStates;

    ngOnInit(): void {
        this.cupState = this.getCupState();
    }

    private getCupState(): CupStates {
        const startTime = +this.news.cup.startTime;
        const endTime = +this.news.cup.endTime;
        const currentTime = +moment().format('X');

        if (currentTime < startTime) {
            return CupStates.NOT_STARTED;
        }

        if (currentTime > endTime) {
            return CupStates.FINISHED;
        }

        return CupStates.IN_PROGRESS;
    }
}
