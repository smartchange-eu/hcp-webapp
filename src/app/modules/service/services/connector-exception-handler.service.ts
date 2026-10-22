import { Injectable } from '@angular/core';
import { ExceptionHandler } from '@eng-it4h/fhir-r5';
import { Observable, ObservableInput, of, throwError } from 'rxjs';
import { ExceptionHandlerService } from '@eng-it4h/heart-ui-connector';
import { Router } from '@angular/router';
import { ErrorCodes } from '../../../config/service/error-codes.enum';
import { SERVER_OIDC } from '@config/server-configuration.conf';
import { HttpErrorResponse } from '@angular/common/http';

/**
 * This service is just a placeholder that just logs the error to the console, in case you don't need it at all
 */
type ExceptionHandlerFunction = (
  error: any,
  caught?: Observable<any>
) => ObservableInput<any>;

@Injectable()
export class CustomExceptionHandler extends ExceptionHandlerService {
  private exceptionHandler: ExceptionHandler;

  public constructor(private router: Router) {
    super();

    this.exceptionHandler = (
      operation: string = 'operation'
    ): ExceptionHandlerFunction => {
      return (error: any, caught?: Observable<any>): ObservableInput<any> => {
        // Manage 401 HTTP Error
        if (error && error.status === 401) {
          console.error(
            `[ERROR] in ${operation} ${error.statusText} ${error.status} now you must be kicked-out`
          );

          const errorCode = ErrorCodes.BACKEND_CALL_NOT_AUTHORIZED.toString();

          return this.router.navigate([SERVER_OIDC.unauthorizedRoute], {
            queryParams: {
              code: errorCode,
            },
            replaceUrl: true,
          });
        }

        // Any other HttpError is just re-thrown
        let errorMessage = `Error in ${operation}`;
        if (error) {
          if (error instanceof HttpErrorResponse) {
            errorMessage += ' ' + error.statusText + ' ' + error.status;
          } else {
            errorMessage += ' ' + JSON.stringify(error);
          }
        }

        // instead of a simple Observable we need an Error otherwise we do catch any HTTP Exception
        throw new Error(errorMessage);
      };
    };
  }

  public getExceptionHandler(): ExceptionHandler {
    return this.exceptionHandler;
  }
}
