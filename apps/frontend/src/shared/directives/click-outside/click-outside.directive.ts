import { Directive, Output, EventEmitter, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[clickOutside]',
  standalone: false,
})
export class ClickOutsideDirective {
  @Output() clickOutside = new EventEmitter<void>();

  constructor(private elementRef: ElementRef) {}

  @HostListener('document:click', ['$event.target'])
  public onClick(target: EventTarget | null) {
    const clickedInside = this.elementRef.nativeElement.contains(target as Node);

    if (!clickedInside) {
      this.clickOutside.emit();
    }
  }
}
