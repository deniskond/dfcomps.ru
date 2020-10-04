import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inject, Component, OnInit, ElementRef, ViewChild, EventEmitter, Output, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { COUNTRIES_CONFIG } from '../../../../configs/countries.config';
import { CountryInterface } from '../../../../interfaces/country.interface';
import { ProfileService } from '../../services/profile.service';
import { filter, finalize } from 'rxjs/operators';

@Component({
    templateUrl: './edit-profile-dialog.html',
    styleUrls: ['./edit-profile-dialog.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditProfileDialogComponent implements OnInit {
    @Output()
    reloadProfile = new EventEmitter<void>();

    @ViewChild('fileInput', { static: true }) fileInput: ElementRef;

    public isLoading = false;
    public editProfileForm: FormGroup;
    public countries = COUNTRIES_CONFIG.COUNTRIES;
    public isNickChangeAllowed = false;

    constructor(
        public dialogRef: MatDialogRef<EditProfileDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { nick: string; country: string },
        private profileService: ProfileService,
    ) {
    }

    ngOnInit(): void {
        const selectedCountry = this.countries.find(
            (country: CountryInterface) => country.shortName === this.data.country,
        );
        const selectedCountryName = selectedCountry && selectedCountry.fullName;

        this.editProfileForm = new FormGroup({
            nick: new FormControl(this.data.nick, Validators.required),
            avatar: new FormControl(''),
            country: new FormControl(selectedCountryName, Validators.required),
        });

        this.setIsNickChangeAllowed();
    }

    public onEditProfileClick(): void {
        this.isLoading = true;

        const countryShortName = this.countries.find(
            (country: CountryInterface) => country.fullName === this.editProfileForm.get('country').value,
        ).shortName;

        this.profileService
            .updateProfile$(
                this.editProfileForm.get('nick').value,
                this.fileInput.nativeElement.files[0],
                countryShortName,
            )
            .pipe(finalize(() => (this.isLoading = false)))
            .subscribe(() => {
                this.reloadProfile.emit();
                this.dialogRef.close();
            });
    }

    private setIsNickChangeAllowed(): void {
        this.profileService
            .getProfileNickCanBeChanged$()
            .pipe(filter(isAllowed => !isAllowed))
            .subscribe(() => this.editProfileForm.get('nick').disable());
    }
}
