import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  OnChanges,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { Physics, WR_PAGINATION_SIZE, WrListItemInterface, WrListResponseInterface } from '@dfcomps/contracts';
import { WrDatabaseService } from '../../services/wr-database.service';

@Component({
  selector: 'app-wr-list',
  templateUrl: './wr-list.component.html',
  styleUrls: ['./wr-list.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class WrListComponent implements OnInit, OnChanges, OnDestroy {
  @Input() refreshTrigger = 0;

  public records: WrListItemInterface[] = [];
  public totalCount = 0;
  public currentPage = 0;
  public physics = Physics;
  public selectedPhysics: Physics | null = null;
  public filterControl = new FormControl('');
  public isLoading = false;

  private destroy$ = new Subject<void>();

  constructor(
    private wrDatabaseService: WrDatabaseService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadRecords();

    this.filterControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.currentPage = 0;
        this.loadRecords();
      });
  }

  ngOnChanges(): void {
    if (this.refreshTrigger > 0) {
      this.loadRecords();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public get pagesCount(): number {
    return Math.ceil(this.totalCount / WR_PAGINATION_SIZE);
  }

  public changePhysicsFilter(physics: Physics | null): void {
    this.selectedPhysics = physics;
    this.currentPage = 0;
    this.loadRecords();
  }

  public onPageChange(page: number): void {
    this.currentPage = page;
    this.loadRecords();
  }

  public formatTime(seconds: number): string {
    const totalMs = Math.round(seconds * 1000);
    const ms = totalMs % 1000;
    const totalSec = Math.floor(totalMs / 1000);
    const sec = totalSec % 60;
    const min = Math.floor(totalSec / 60);
    return `${min}:${String(sec).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
  }

  public formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  private loadRecords(): void {
    this.isLoading = true;
    this.changeDetectorRef.markForCheck();

    this.wrDatabaseService
      .getWrList$(this.currentPage + 1, this.filterControl.value ?? '', this.selectedPhysics ?? '')
      .pipe(takeUntil(this.destroy$))
      .subscribe((response: WrListResponseInterface) => {
        this.records = response.records;
        this.totalCount = response.totalCount;
        this.isLoading = false;
        this.changeDetectorRef.markForCheck();
      });
  }
}
