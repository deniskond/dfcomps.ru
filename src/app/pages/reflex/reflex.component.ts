import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-reflex',
    templateUrl: './reflex.component.html',
    styleUrls: ['./reflex.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReflexComponent implements OnInit {
    constructor(private router: Router) {}

    ngOnInit(): void {
        this.router.navigate(['/news/382']);
    }
}
