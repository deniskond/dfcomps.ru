import { FlagComponent } from '../components/flag/flag.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
    declarations: [FlagComponent],
    imports: [CommonModule],
    exports: [FlagComponent],
})
export class SharedModule {}