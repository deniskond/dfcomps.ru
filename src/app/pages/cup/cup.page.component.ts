import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CupPageTypes } from './enums/cup-page-types.enum';

@Component({
    selector: 'app-cup-page',
    templateUrl: './cup.page.component.html',
    styleUrls: ['./cup.page.component.less'],
})
export class CupPageComponent {
    public type: CupPageTypes;

    constructor(private activatedRoute: ActivatedRoute) {
        this.type = this.activatedRoute.snapshot.params.type;
    }
}
