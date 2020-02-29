import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-reflex',
    templateUrl: './reflex.component.html',
    styleUrls: ['./reflex.component.less'],
})
export class ReflexComponent implements OnInit {
    constructor(private router: Router) {}

    ngOnInit(): void {
        this.router.navigate(['/news/375']);
    }
}
