import { Physics } from '../../../../enums/physics.enum';
import { NewsMulticupResultsInterface } from '../../../../services/news-service/interfaces/news-multicup-results.interface';
import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-news-multicup-results',
    templateUrl: './news-multicup-results.component.html',
    styleUrls: ['./news-multicup-results.component.less'],
})
export class NewsMulticupResultsComponent {
    @Input() news: NewsMulticupResultsInterface;

    public physics = Physics;
}
