import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../service/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ){

    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    })
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    const { username, password } = this.loginForm.value;

    this.authService.login(username, password).subscribe(
      (response) => {
        this.authService.storeUserData(response);
        this.router.navigate(['/dashboard']);
        this.snackBar.open('Login successful!', 'Close', { duration: 3000 });
      },
      (error) => {
        this.snackBar.open('Login failed. Please try again.', 'Close', { duration: 3000 });
      }
    );
  }

  // onSubmit(): void {
  //   if (this.loginForm.invalid) return;
  
  //   const { username, password } = this.loginForm.value;
  
  //   this.authService.login(username, password).subscribe(
  //     (response) => {
  //       // Make sure the token is valid
  //       const token = localStorage.getItem('access_token');
  //       if (token && !this.authService.jwtHelper.isTokenExpired(token)) {
  //         this.router.navigate(['/dashboard']);  // Redirect to the dashboard if token is valid
  //       } else {
  //         this.snackBar.open('Invalid or expired token. Please log in again.', '', {
  //           duration: 3000,
  //         });
  //       }
  //     },
  //     (error) => {
  //       this.snackBar.open('Invalid Credentials, please try again..', '', {
  //         duration: 3000,
  //       });
  //     }
  //   );
  // }

}
