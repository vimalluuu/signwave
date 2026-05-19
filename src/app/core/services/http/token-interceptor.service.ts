import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {from, Observable, of, switchMap, catchError} from 'rxjs';
import {AppCheck} from '../../helpers/app-check/app-check';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (
      req.url.includes('/api/') ||
      req.url.includes('cloudfunctions.net') ||
      req.url.includes('sign-mt/us-central1')
    ) {
      // Dev override: Allow pasting a production AppCheck token in LocalStorage for local testing
      const devToken = (typeof window !== 'undefined') ? window.localStorage.getItem('devAppCheckToken') : null;
      const appCheckToken$ = devToken ? of(devToken) : from(AppCheck.getToken()).pipe(
        catchError(err => {
          console.warn('AppCheck failed to initialize or obtain token. Proceeding without AppCheck headers.', err);
          return of('');
        })
      );

      return appCheckToken$.pipe(
        switchMap(token => {
          let clonedReq = req;
          if (token) {
            clonedReq = req.clone({
              headers: req.headers
                .set('X-Firebase-AppCheck', token) // Python Cloud Functions
                .set('X-AppCheck-Token', token), // Node.js Cloud Functions
            });
          }
          return next.handle(clonedReq);
        })
      );
    }

    return next.handle(req);
  }
}
