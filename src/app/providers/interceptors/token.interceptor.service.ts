import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, switchMap, filter, take } from 'rxjs/operators';

import { Injectable } from '@angular/core';
import { LoadingIndicatorService } from '../loading-indicator.service';
import { ToastService } from '../toast.service';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { AuthService } from '../auth/auth.service';


@Injectable({
  providedIn: 'root'
})
export class InterceptorService implements HttpInterceptor {

  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  access_token: any;

  constructor(private authService: AuthService, private storage: NativeStorage, public loader: LoadingIndicatorService, public toast: ToastService) {

  }

  private addToken(request: HttpRequest<any>, token: string) {

    return request.clone({
      setHeaders: {
        'Authorization': `Bearer ${token}`
      }
    });

  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    this.storage.getItem('token').then((val) => {
      console.log('Token', val);
      this.access_token = val;
    }, error => console.error(error));

    if (this.access_token && !request.headers.has('Authorization')) {
      request = request.clone({
        setHeaders: {
          'Authorization': "Bearer " + this.access_token
        }
      });
    }

    if (!request.headers.has('Content-Type')&&!request.url.includes('retrieveAudit')) {
      request = request.clone({
        setHeaders: {
          'content-type': 'application/json;charset=UTF-8'
        }
      });
    }
    if(request.url.includes('mobileSynchronize')){
      request = request.clone({
        headers: request.headers.set('Accept', 'application/json, text/plain, */*')
      });
    }
    else{
    request = request.clone({
      headers: request.headers.set('Accept', 'application/json')
    });
  }

    return next.handle(request).pipe(catchError(error => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        return this.handle401Error(request, next);;
      } else if (error instanceof HttpErrorResponse && error.status === 404) {
        this.toast.presentToast('Server under Maintenance, Please try after sometime');
        return throwError(error);
      } else if (error instanceof HttpErrorResponse && error.status === 500) {
        this.toast.presentToast('Something went wrong please contact Admin..!');
        return throwError(error);
      } else {
        return throwError(error);
      }
    }));
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshToken().pipe(
        switchMap((token: any) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(token.access_token);
          return next.handle(this.addToken(request, token.access_token));
        }));

    } else {
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(jwt => {
          return next.handle(this.addToken(request, jwt));
        }));
    }
  }
}


