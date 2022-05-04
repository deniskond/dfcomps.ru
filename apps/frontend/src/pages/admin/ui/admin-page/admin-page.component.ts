import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'admin-page',
  templateUrl: './admin-page.component.html',
  styleUrls: ['./admin-page.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPageComponent implements OnInit {
  public activePage: string;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.setInitialActivePage();
  }

  public navigateTo(page: string): void {
    this.activePage = page;
    this.router.navigate([`admin/${page}`]);
  }

  private setInitialActivePage(): void {
    const url: string[] = this.router.url.split('/');

    this.activePage = url[2] || 'news';
  }
}
