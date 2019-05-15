import { Component, Input } from '@angular/core';
import { ProfileCupInterface } from '../../interfaces/profile-cup.interface';

@Component({
    selector: 'app-profile-cups-table',
    templateUrl: './profile-cups-table.component.html',
    styleUrls: ['./profile-cups-table.component.less'],
})
export class ProfileCupsTableComponent {
    @Input()
    cups: ProfileCupInterface[];
}
