import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-map-suggestion',
  templateUrl: './map-suggestion.component.html',
  styleUrls: ['./map-suggestion.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapSuggestionComponent {
  public isLoading = false;

  constructor(public dialogRef: MatDialogRef<MapSuggestionComponent>) {}
}
