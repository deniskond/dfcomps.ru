import { FlagComponent } from '../components/flag/flag.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RatingChangeComponent } from '../components/rating-change/rating-change.component';

const COMPONENTS = [FlagComponent, RatingChangeComponent];

@NgModule({
    declarations: COMPONENTS,
    imports: [CommonModule],
    exports: COMPONENTS,
})
export class SharedModule {}