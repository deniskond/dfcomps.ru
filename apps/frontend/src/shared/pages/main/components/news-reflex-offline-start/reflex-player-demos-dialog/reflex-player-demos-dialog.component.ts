import { DemosService } from '../../../../../services/demos/demos.service';
import { UploadedDemoInterface } from '../../../../../interfaces/uploaded-demo.interface';
import { Component, Inject, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { formatResultTime } from '../../../../../helpers/result-time.helper';
import { BehaviorSubject } from 'rxjs';
import { LanguageService } from '../../../../../services/language/language.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-reflex-player-demos-dialog',
  templateUrl: './reflex-player-demos-dialog.component.html',
  styleUrls: ['./reflex-player-demos-dialog.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReflexPlayerDemosDialogComponent {
  @Output()
  reloadNews = new EventEmitter<void>();

  public demos$ = new BehaviorSubject<UploadedDemoInterface[]>([]);
  public loading: Record<string, boolean>;

  constructor(
    public dialogRef: MatDialogRef<ReflexPlayerDemosDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { demos: UploadedDemoInterface[]; cupName: string; cupId: string },
    private demosService: DemosService,
    private languageService: LanguageService,
  ) {
    this.demos$.next(this.data.demos);
  }

  public getFormattedTime(time: string): string {
    return formatResultTime(time);
  }

  public deleteDemo(demoName: string): void {
    this.languageService
      .getTranslation$('confirmDelete')
      .pipe(take(1))
      .subscribe((confirmDeleteCaption: string) => {
        if (!confirm(confirmDeleteCaption)) {
          return;
        }

        this.loading = {
          ...this.loading,
          [demoName]: true,
        };

        this.demosService.deleteDemo$(demoName, this.data.cupId).subscribe((demos: UploadedDemoInterface[]) => {
          this.demos$.next(demos);
          this.reloadNews.emit();
        });
      });
  }

  public isLoading(demoName: string): boolean {
    return !!this.loading && !!this.loading[demoName];
  }
}
