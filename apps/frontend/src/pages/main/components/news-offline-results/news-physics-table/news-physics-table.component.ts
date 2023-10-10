import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { range } from 'lodash';
import { CUSTOM_TABLE_NEWS_LIMIT } from '../../../config/news.config';
import { formatResultTime } from '~shared/helpers/result-time.helper';
import { getTablePlaces } from '~shared/helpers/table-places.helper';
import { CupInterface, ValidDemoInterface } from '@dfcomps/contracts';
import { Physics } from '@dfcomps/contracts';

@Component({
  selector: 'app-news-physics-table',
  templateUrl: './news-physics-table.component.html',
  styleUrls: ['./news-physics-table.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsPhysicsTableComponent implements OnInit {
  @Input() physics: Physics;
  @Input() physicsTable: ValidDemoInterface[];
  @Input() archiveLink: string;
  @Input() maxDemosCount: number;
  @Input() cup: CupInterface;
  @Input() customTable: boolean;

  public places: number[];
  public range = range;
  public table: ValidDemoInterface[];

  ngOnInit(): void {
    this.table = this.customTable ? this.physicsTable.slice(0, CUSTOM_TABLE_NEWS_LIMIT) : this.physicsTable;
    this.places = getTablePlaces(this.table.map(({ time }: ValidDemoInterface) => +time));
  }

  public formatResult(time: string): string {
    return formatResultTime(time);
  }

  public getDemoLink(result: ValidDemoInterface, cupId: string): string {
    return result.absoluteLink ? result.demopath : `/uploads/demos/cup${cupId}/${result.demopath}`;
  }

  public openFullMulticupTable(): void {
    window.open(`${window.location.origin}/cup/multi?id=${this.cup.multicupId}&physics=${this.physics}`, '_blank')!.focus();
  }
}
