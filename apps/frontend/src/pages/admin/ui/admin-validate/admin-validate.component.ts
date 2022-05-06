import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Observable, switchMap } from 'rxjs';
import { AdminDataService } from '../../business/admin-data.service';
import { AdminValidationInterface } from '../../models/admin-validation.interface';

@Component({
  selector: 'dfcomps.ru-admin-validate',
  templateUrl: './admin-validate.component.html',
  styleUrls: ['./admin-validate.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminValidateComponent implements OnInit {
  public cupValidationInfo$: Observable<AdminValidationInterface>;

  constructor(private adminDataService: AdminDataService, private activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.cupValidationInfo$ = this.activatedRoute.params.pipe(
      switchMap((params: Params) => this.adminDataService.getCupValidationInfo$(params['id'])),
    );
  }
}
