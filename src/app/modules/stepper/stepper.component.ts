import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { MatStepper } from '@angular/material/stepper';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { Step } from './step';
import { StepperSelectionEvent } from '@angular/cdk/stepper';

@Component({
  selector: 'app-stepper',
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.scss'],
})
export class StepperComponent implements OnInit, AfterViewInit {
  @ViewChild('stepper') stepper: MatStepper | undefined;
  @ViewChildren(RouterOutlet) fooList: any;
  @ViewChildren('myStep') stepList: any;
  @Input()
  steps: Step[] = [];

  @Output() public finished = new EventEmitter<boolean>();
  @Output() public isLast = new EventEmitter<boolean>();

  selectedStepIndex = 0;
  constructor(
    private readonly router: Router,
    private _route: ActivatedRoute
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit() {
    this.stepList.changes.subscribe((t: any) => {
      this.ngForRendred();
    });
  }

  ngForRendred() {
    console.log('NgFor is Rendered', this.fooList);
  }

  selectionChanged(event: StepperSelectionEvent) {
    this.selectedStepIndex = event.selectedIndex;
    const url = this.steps[this.selectedStepIndex].path;
    this.router.navigate([url], { relativeTo: this._route.parent });
    if (event.selectedIndex === this.steps.length - 1) {
      this.isLast.emit(true);
    }
  }

  finish() {
    this.finished.emit(true);
  }
}
