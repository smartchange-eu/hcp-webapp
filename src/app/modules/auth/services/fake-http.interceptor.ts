import { SECURE_ROUTES } from './../../../config/server-configuration.conf';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';

export class FakeHttpInterceptor implements HttpInterceptor {
  public intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (!environment.production) {
      if (
        SECURE_ROUTES.routes.find((r) => req.url.startsWith(r)) &&
        !req.headers.has('Authorization')
      ) {
        console.log('using DEV admin token');
        const modifiedReq = req.clone({
          headers: req.headers.set('Authorization', 'Bearer THEBESTOF'),
        });
        return next.handle(modifiedReq);
      }
    }
    return next.handle(req);
  }
}
