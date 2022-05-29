import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

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
    timeOption: new FormControl('now', Validators.required),
    postingTime: new FormControl(''),
    russianText: new FormControl('', Validators.required),
    englishText: new FormControl('', Validators.required),
  }, this.postingTimeValidator());

  public submitNews(): void {
    Object.keys(this.addSimpleNewsForm.controls).forEach((key: string) =>
      this.addSimpleNewsForm.get(key)!.markAsDirty(),
    );

    if (!this.addSimpleNewsForm.valid) {
      return;
    }

    alert('ok');
  }

  public hasFieldError(control: AbstractControl): boolean {
    return !!control!.errors && !control!.pristine;
  }

  public postingTimeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const timeOption: string = control.get('timeOption')!.value;

      if (timeOption === 'now') {
        return null;
      }

      if (control.get('postingTime')!.value) {
        return null;
      }

      return { postingTimeEmpty: { value: control.get('postingTime')!.value } };
    };
  }
}
