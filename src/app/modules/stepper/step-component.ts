import { Observable } from 'rxjs';

export interface StepComponent {
  canDeactivate: () => boolean;
}
