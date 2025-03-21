import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { InactivityService } from '../../service/inactivity/inactivity.service';

@Component({
  selector: 'app-lock-screen',
  templateUrl: './lock-screen.component.html',
  styleUrls: ['./lock-screen.component.css']
})
export class LockScreenComponent {

  password: string = '';
  error: string = '';
  isUnlocking = false;
  isLocked$ = this.inactivityService.isLocked$;
  //returnUrl: string;

  constructor(
    public authService: AuthService,
    private inactivityService: InactivityService,
    //private route: ActivatedRoute,
    private router: Router
  ) {
    //this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
     // Dynamically toggle 'locked' class on body
     this.isLocked$.subscribe(isLocked => {
      if (isLocked && this.authService.isAuthenticated()) {
        document.body.classList.add('locked');
      } else {
        document.body.classList.remove('locked');
      }
    });
  }

  unlock() {
    this.isUnlocking = true;
    this.authService.verifyPassword(this.password).subscribe({
      next: (response) => {
        if (response.message === 'Password verified') {
          this.inactivityService.unlockScreen();
          this.password = '';
          this.error = '';
        } else {
          this.error = 'Unexpected response from server';
        }
        this.isUnlocking = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Invalid password';
        this.isUnlocking = false;
        //console.error('Unlock failed:', err);
      }
    });
  }

}
