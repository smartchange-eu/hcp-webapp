import {
  AbstractControl,
  AsyncValidatorFn,
  ValidationErrors,
} from '@angular/forms';

import { HeartUiConnectorService } from '@eng-it4h/heart-ui-connector';

export function validateUsernameAvailability(
  connectorService: HeartUiConnectorService
): AsyncValidatorFn {
  return async (control: AbstractControl): Promise<ValidationErrors | null> => {
    const username: string = control.value;

    if (!username) {
      return Promise.resolve(null);
    }

    let available = await connectorService.patientConnector.isUsernameAvailable(
      username
    );

    // Restituisci un errore di tipo 'notAvailable' solo se lo username è già in uso
    return available ? null : { notAvailable: true, userExists: true };
  };
}

export function validatePseudonymAvailability(
  connectorService: HeartUiConnectorService
): AsyncValidatorFn {
  return async (control: AbstractControl): Promise<ValidationErrors | null> => {
    const username: string = control.value;

    if (!username) {
      return Promise.resolve(null);
    }

    const available =
      await connectorService.patientConnector.isPseudonymAvailable(username);
    // Restituisci un errore di tipo 'notAvailable' solo se lo username è già in uso
    return available ? null : { notAvailable: true };
  };
}
