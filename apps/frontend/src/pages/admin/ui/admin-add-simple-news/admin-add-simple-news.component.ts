import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'dfcomps.ru-admin-add-simple-news',
  templateUrl: './admin-add-simple-news.component.html',
  styleUrls: ['./admin-add-simple-news.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminAddSimpleNewsComponent {
  public addSimpleNewsForm = new FormGroup({
    russianTitle: new FormControl('', Validators.required),
    englishTitle: new FormControl('', Validators.required),
    postingTime: new FormControl('', Validators.required),
    russianText: new FormControl('', Validators.required),
    englishText: new FormControl('', Validators.required),
  });

  public submitNews(): void {
    Object.keys(this.addSimpleNewsForm.controls).forEach((key: string) => this.addSimpleNewsForm.get(key)!.markAsDirty());

    if (!this.addSimpleNewsForm.valid) {
      return;
    }
  }

  public hasFieldError(control: AbstractControl): boolean {
    return !!control!.errors && !control!.pristine;
  }
}
