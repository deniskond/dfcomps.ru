import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { AdminEditCupInterface } from '@dfcomps/contracts';
import { AdminDataService } from '~pages/admin/business/admin-data.service';

@Component({
  selector: 'admin-input-results',
  templateUrl: './admin-input-results.component.html',
  styleUrls: ['./admin-input-results.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminInputResultsComponent implements OnInit {
  public cupId: number;
  public cupName: string;
  public onlineCupMapsForm: FormGroup | null = null;
  public range = (n: number) => new Array(+n).fill(null);

  constructor(
    private adminDataService: AdminDataService,
    private activatedRoute: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.getOnlineCupInfo();
  }

  public saveOnlineCupMaps(): void {
    this.adminDataService
      .setOnlineCupMaps$(
        this.cupId,
        JSON.stringify([
          this.onlineCupMapsForm?.get('map1')!.value,
          this.onlineCupMapsForm?.get('map2')!.value,
          this.onlineCupMapsForm?.get('map3')!.value,
          this.onlineCupMapsForm?.get('map4')!.value,
          this.onlineCupMapsForm?.get('map5')!.value,
        ]) as any,
      )
      .subscribe(() => {
        this.snackBar.open(`Successfully saved online cup (${this.cupName}) maps`, '', { duration: 2000 });
      });
  }

  private getOnlineCupInfo(): void {
    this.cupId = this.activatedRoute.snapshot.params['id'];

    this.adminDataService.getSingleCup$(this.cupId).subscribe((cupInfo: AdminEditCupInterface) => {
      this.onlineCupMapsForm = new FormGroup({
        map1: new FormControl(cupInfo.maps[0], Validators.required),
        map2: new FormControl(cupInfo.maps[1], Validators.required),
        map3: new FormControl(cupInfo.maps[2], Validators.required),
        map4: new FormControl(cupInfo.maps[3], Validators.required),
        map5: new FormControl(cupInfo.maps[4], Validators.required),
      });

      this.cupName = cupInfo.fullName;
      this.changeDetectorRef.markForCheck();
    });
  }
}
