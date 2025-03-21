import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LockEventService {

  private resetLockSubject = new Subject<void>();
  public resetLock$ = this.resetLockSubject.asObservable();

  resetLock() {
    this.resetLockSubject.next();
  }

  constructor() { }
}
