import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminDataService } from '../../business/admin-data.service';
import { AdminOperationType } from '../../models/admin-operation-type.enum';

@Component({
  selector: 'admin-add-simple-news',
  templateUrl: './admin-simple-news.component.html',
  styleUrls: ['./admin-simple-news.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminSimpleNewsComponent implements OnInit {
  public operationType: AdminOperationType;
  public addSimpleNewsForm = new FormGroup(
    {
      russianTitle: new FormControl('', Validators.required),
      englishTitle: new FormControl('', Validators.required),
      timeOption: new FormControl('now', Validators.required),
      postingTime: new FormControl(''),
      russianText: new FormControl('', Validators.required),
      englishText: new FormControl('', Validators.required),
    },
    this.postingTimeValidator(),
  );

  constructor(
    private adminDataService: AdminDataService,
    private router: Router,
    private snackBar: MatSnackBar,
    private activatedRoute: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.operationType = this.activatedRoute.snapshot.params['action'];
  }

  public submitNews(): void {
    Object.keys(this.addSimpleNewsForm.controls).forEach((key: string) =>
      this.addSimpleNewsForm.get(key)!.markAsDirty(),
    );

    if (!this.addSimpleNewsForm.valid) {
      return;
    }

    this.adminDataService.postSimpleNews$(this.addSimpleNewsForm.value).subscribe(() => {
      this.router.navigate(['/admin/news']);
      this.snackBar.open('News added successfully', 'OK', { duration: 3000 });
    });
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
