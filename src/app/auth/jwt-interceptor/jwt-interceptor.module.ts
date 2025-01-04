import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { catchError, Observable, switchMap } from 'rxjs';
import { AuthService } from '../service/auth.service';



@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ]
})
export class JwtInterceptorModule implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const accessToken = this.authService.getAccessToken();

    // If access token exists, clone the request and add the Authorization header
    if (accessToken) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    }

    return next.handle(req).pipe(
      catchError((error) => {
        if (error.status === 401) {
          // Handle token expiration here by refreshing the access token
          return this.authService.refreshAccessToken().pipe(
            switchMap((newAuthResponse) => {
              if (newAuthResponse) {
                // Retry the failed request with the new access token
                const retryReq = req.clone({
                  setHeaders: {
                    Authorization: `Bearer ${newAuthResponse.access_token}`,
                  },
                });
                return next.handle(retryReq);
              } else {
                return next.handle(req);
              }
            })
          );
        }
        throw error;  // Re-throw the error if it's not related to token expiration
      })
    );
  } 
}

 // constructor(private authService: AuthService) { }

  // intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
  //   let currentUser = this.authService.currentUserValue;
  //   if (currentUser && currentUser.access_token) {
  //     // Clone request and add the Authorization header with the JWT token
  //     request = request.clone({
  //       setHeaders: {
  //         Authorization: `Bearer ${currentUser.access_token}`
  //       }
  //     });
  //   }
  //   return next.handle(request);
  // }
