import { Component, OnInit, ElementRef, AfterViewInit, ViewEncapsulation, Input } from "@angular/core";

import { debounceTime, fromEvent } from "rxjs";

@Component({
  selector: "heart-button-bar-pagination",
  templateUrl: "./button-bar-pagination.component.html",
  styleUrls: ["./button-bar-pagination.component.scss"],
  encapsulation: ViewEncapsulation.None
})
export class ButtonBarPaginationComponent implements OnInit, AfterViewInit {
  @Input() color: 'primary' | 'accent' | undefined;

  // @Input() cutOffWidth: number = 400;

  protected showScroll: boolean = false;

  private _arrowsWidth: number = 2 * 36;
  private _movementWidth: number = 100;
  private _maxLeft: number = 0;
  private _container?: HTMLElement;
  private _buttons?: HTMLElement;

  public constructor(private el: ElementRef) {}

  public ngOnInit(): void {
    this.showScroll = this.calculateShowScroll(window);

    if ( this.color ) {
      this.el.nativeElement.classList.add("mat-" + this.color);
    }
  }

  public ngAfterViewInit(): void {
    this._container = this.el.nativeElement.querySelector( ".button-nav-bar-pagination" );
    this._buttons = this.el.nativeElement.querySelector( ".button-nav-bar-container > nav" );
    this._calcMaxLeft();

    fromEvent(window, "resize")
      .pipe( debounceTime(250) )
      .subscribe((event: any) => this._onResize(event) );
  }

  protected rightArrow(): void {
    const newPosition = this._getLeft() - this._movementWidth;
    if ( this._buttons ) {
      this._buttons.style!.left = newPosition > this._maxLeft ? `${newPosition}px` : `${this._maxLeft}px`;
    }
  }

  protected leftArrow(): void {
    const newPosition = this._getLeft() + this._movementWidth;
    if ( this._buttons ) {
      this._buttons.style.left = newPosition < 0 ? `${newPosition}px` : `0px`;
    }
  }

  private _calcMaxLeft(): void {
    if (this.showScroll && this._buttons) {
      // this._maxLeft = this.el.nativeElement.clientWidth - this._buttons.clientWidth - this._arrowsWidth;
      this._maxLeft = (this._container?.clientWidth || this.el.nativeElement.clientWidth) - this._buttons.clientWidth - this._arrowsWidth;
    } else {
      this._maxLeft = 0;
    }
  }

  private _getLeft(): number {
    return parseInt(this._buttons?.style?.left || "0");
  }

  private calculateShowScroll(target: any): boolean {
    return (this._container?.clientWidth || 0) <= (this._buttons?.clientWidth || 0);
    // return target.innerWidth <= this.cutOffWidth;
  }

  private _onResize(event: any): void {
    this.showScroll = this.calculateShowScroll(event.target);

    this._calcMaxLeft();

    const left = this._getLeft();

    if ( this._buttons ) {
      if (left < this._maxLeft) {
        this._buttons.style.left = `${this._maxLeft}px`;
      } else if (left > 0) {
        this._buttons.style.left = `0px`;
      }
    }
  }
}
