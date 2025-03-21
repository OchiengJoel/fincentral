import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, map, Observable, of } from 'rxjs';
import { AuthService } from './service/auth.service';
import { InactivityService } from './service/inactivity/inactivity.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private inactivityService: InactivityService, 
    private router: Router) {}

    canActivate(): Observable<boolean> | boolean {
      // Check authentication
      if (!this.authService.isAuthenticated()) {
        this.router.navigate(['/login']);
        return false;
      }

      const token = this.authService.getAccessToken();
    if (token && this.authService.isTokenExpired(token)) {
      return this.authService.refreshAccessToken().pipe(
        map(() => true),
        catchError(() => {
          this.router.navigate(['/login']);
          return of(false);
        })
      );
    }

    return true; // Lock screen is handled by the overlay, not navigation
  }
  
    //   const token = this.authService.getAccessToken();
    //   if (token && this.authService.isTokenExpired(token)) {
    //     return this.authService.refreshAccessToken().pipe(
    //       map(() => true),
    //       catchError(() => {
    //         this.router.navigate(['/login']);
    //         return of(false);
    //       })
    //     );
    //   }
  
    //   // Check if screen is locked
    //   return this.inactivityService.isLocked$.pipe(
    //     map(isLocked => {
    //       if (isLocked) {
    //         this.router.navigate(['/lock'], { queryParams: { returnUrl: this.router.url } });
    //         return false;
    //       }
    //       return true;
    //     })
    //   );
    // }
  
}

  // constructor(
  //   private authService: 
  //   AuthService, private router: Router) {}

  // canActivate(): boolean {
  //   if (this.authService.isAuthenticated()) {
  //     return true; // Allow access to the route
  //   } else {
  //     this.router.navigate(['/']); // Redirect to login page
  //     return false; // Deny access to the route
  //   }
 

  // constructor(private authService: AuthService, private router: Router) {}

  // canActivate(
  //   next: ActivatedRouteSnapshot,
  //   state: RouterStateSnapshot
  // ): Observable<boolean> | Promise<boolean> | boolean {
  //   if (this.authService.isAuthenticated()) {
  //     return true;
  //   }

  //   this.router.navigate(['/login']);
  //   return false;
  // }

  // constructor(private authService: AuthService, private router: Router) {}

  // canActivate(): Observable<boolean> {
  //   return new Observable<boolean>((observer) => {
  //     this.authService.currentUser.subscribe((user) => {
  //       if (user) {
  //         observer.next(true);
  //       } else {
  //         this.router.navigate(['/login']);
  //         observer.next(false);
  //       }
  //       observer.complete();
  //     });
  //   });
  // }




  // constructor(private authService: AuthService, private router: Router) {}

  // canActivate(
  //   route: ActivatedRouteSnapshot,
  //   state: RouterStateSnapshot
  // ): Observable<boolean> | Promise<boolean> | boolean {
  //   if (this.authService.currentUserValue) {
  //     // User is authenticated, allow access to the dashboard
  //     return true;
  //   } else {
  //     // User is not authenticated, redirect to the login page
  //     this.router.navigate(['/login']);
  //     return false;
  //   }
  // }
