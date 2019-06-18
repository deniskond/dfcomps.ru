import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-weapons',
    templateUrl: './weapons.component.html',
    styleUrls: ['./weapons.component.less'],
})
export class WeaponsComponent {
    @Input() weapons: string;

    public get hasGrenade(): boolean {
        return this.weapons.indexOf('G') !== -1;
    }

    public get hasRocket(): boolean {
        return this.weapons.indexOf('R') !== -1;
    }

    public get hasPlasma(): boolean {
        return this.weapons.indexOf('P') !== -1;
    }

    public get hasBFG(): boolean {
        return this.weapons.indexOf('B') !== -1;
    }

    public get hasGauntlet(): boolean {
        return this.weapons.indexOf('U') !== -1;
    }

    public get hasMachinegun(): boolean {
        return this.weapons.indexOf('U') !== -1;
    }

    public get hasShotgun(): boolean {
        return this.weapons.indexOf('S') !== -1;
    }

    public get hasLightning(): boolean {
        return this.weapons.indexOf('L') !== -1;
    }

    public get hasRailgun(): boolean {
        return this.weapons.indexOf('I') !== -1;
    }

    public get hasHook(): boolean {
        return this.weapons.indexOf('H') !== -1;
    }
}
