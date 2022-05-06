import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { AdminDataService } from '../../business/admin-data.service';
import { AdminCupInterface } from '../../models/admin-cup.interface';

@Component({
  selector: 'admin-cups',
  templateUrl: './admin-cups.component.html',
  styleUrls: ['./admin-cups.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCupsComponent implements OnInit {
  public cups: AdminCupInterface[];
  public cups$ = new ReplaySubject<AdminCupInterface[]>(1);

  constructor(private adminDataService: AdminDataService) {}

  ngOnInit(): void {
    this.adminDataService.getAllCups$().subscribe((cups: AdminCupInterface[]) => {
      this.cups = cups;
      this.cups$.next(cups);
    });
  }

  public confirmDelete(): void {}
}
