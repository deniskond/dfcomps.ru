import { BackendService } from '../../../../../services/backend-service/backend-service';
import { ResultsTableInterface } from '../../../../../interfaces/results-table.interface';
import { NewsOfflineResultsInterface } from '../../../../../services/news-service/interfaces/news-offline-results.interface';
import { Injectable } from '@angular/core';
import { DfwcResultsDtoInterface } from '../dto/dfwc-results.dto';
import { DfwcSingleResultDtoInterface } from '../dto/dfwc-single-result.dto';

@Injectable({
    providedIn: 'root',
})
export class DfwcResultsService {
    constructor(private backendService: BackendService) {}

    public mapDfwcResultsToOfflineNews(news: NewsOfflineResultsInterface): NewsOfflineResultsInterface {
        const { vq3, cpm }: DfwcResultsDtoInterface = JSON.parse(news.tableJson);

        return {
            ...news,
            cpmResults: this.getPhysicsResults(cpm),
            vq3Results: this.getPhysicsResults(vq3),
        };
    }

    private getPhysicsResults(results: Record<string, DfwcSingleResultDtoInterface>): ResultsTableInterface {
        const arrayResults: DfwcSingleResultDtoInterface[] = Object.values(results).map(result => result);

        return {
            valid: arrayResults.map((result: DfwcSingleResultDtoInterface) => ({
                bonus: '0',
                change: '0',
                col: '',
                country: result.flag,
                demopath: '',
                impressive: '0',
                nick: result.name,
                playerId: '',
                rating: result.points,
                row: '',
                time: result.time.replace(/\:/, '\.'),
            })),
            invalid: [],
        };
    }
}
