import { CanActivateFn } from '@angular/router';
import { environment } from '@env/environment';

export function websocketGuard(): CanActivateFn {
  return () => {
    return environment.useNotification;
  };
}
