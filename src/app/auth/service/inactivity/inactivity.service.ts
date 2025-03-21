import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { debounceTime, fromEvent, merge, switchMap, timer } from 'rxjs';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { AuthService } from '../auth.service';
import { LockEventService } from '../../inactivity/service/lock-event.service';
import { MatDialog } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root'
})
export class InactivityService {

  //private inactivityTimeout = 5 * 60 * 1000; // 5 minutes
  private inactivityTimeout = 1 * 60 * 1000; // 20 minutes 
  private isLockedSubject = new BehaviorSubject<boolean>(false);
  public isLocked$ = this.isLockedSubject.asObservable();

  constructor(

    private lockEventService: LockEventService,
    
  ) 
  
  {
    this.lockEventService.resetLock$.subscribe(() => {
      this.resetLockState();
    });


    //  // Only initialize lock state if authenticated
    //  if (this.authService.isAuthenticated() && localStorage.getItem('isLocked') === 'true') {
    //   this.isLockedSubject.next(true);
    // } else {
    //   this.resetLockState(); // Ensure lock is off on app start if not authenticated

    // Initial state: no authentication check here
    if (localStorage.getItem('isLocked') === 'true') {
      this.isLockedSubject.next(true);
    } else {
      this.resetLockState();
    }
    this.startInactivityMonitor();
    
  }

  private startInactivityMonitor() {
    const activityEvents$ = merge(
      fromEvent(document, 'mousemove'),
      fromEvent(document, 'keydown'),
      fromEvent(document, 'click'),
      fromEvent(document, 'scroll')
    );

    activityEvents$
      .pipe(
        debounceTime(100),
        switchMap(() => timer(this.inactivityTimeout))
      )
      // .subscribe(() => {
      //   if (this.authService.isAuthenticated() && !this.isLockedSubject.value) {
      //     this.lockScreen();
      //   }
      // });

      .subscribe(() => {
        if (!this.isLockedSubject.value) {
          this.lockScreen();
        }
      });
  }

  lockScreen() {
    this.isLockedSubject.next(true);
    localStorage.setItem('isLocked', 'true');
    //this.router.navigate(['/lock'], { queryParams: { returnUrl: this.router.url } });
  }

  unlockScreen() {
    this.isLockedSubject.next(false);
    localStorage.removeItem('isLocked');
  }

  resetLockState() {
    this.isLockedSubject.next(false);
    localStorage.removeItem('isLocked');
  }

  resetTimer() {
    this.startInactivityMonitor();
  }

}
