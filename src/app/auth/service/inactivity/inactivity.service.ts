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

  private inactivityTimeout = 5 * 60 * 1000; // 5 minutes
  private logoutTimeout = 15 * 60 * 1000; // 15 minutes
  private isLockedSubject = new BehaviorSubject<boolean>(false);
  public isLocked$ = this.isLockedSubject.asObservable();

  constructor(
    private lockEventService: LockEventService,
    private authService: AuthService
  ) {
    this.lockEventService.resetLock$.subscribe(() => {
      this.resetLockState();
    });

    // Only initialize lock state as true if authenticated at startup
    if (this.authService.isAuthenticated() && localStorage.getItem('isLocked') === 'true') {
      this.isLockedSubject.next(true);
    } else {
      this.resetLockState(); // Ensure lock is off if not authenticated
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

    // Lock screen after 1 minute of inactivity
    activityEvents$
      .pipe(
        debounceTime(100),
        switchMap(() => timer(this.inactivityTimeout))
      )
      .subscribe(() => {
        if (!this.isLockedSubject.value) {
          this.lockScreen();
        }
      });

    // Logout after 2 minutes of inactivity
    activityEvents$
      .pipe(
        debounceTime(100),
        switchMap(() => timer(this.logoutTimeout))
      )
      .subscribe(() => {
        if (this.authService.isAuthenticated()) {
          this.authService.logout();
        }
      });
  }

  lockScreen() {
    this.isLockedSubject.next(true);
    localStorage.setItem('isLocked', 'true');
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