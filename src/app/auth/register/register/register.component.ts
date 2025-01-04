import { Component } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { AuthResponse } from '../../model/auth-response';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {


  registerForm: FormGroup;
  errorMessage: string | undefined;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      role: ['ROLE_USER', Validators.required]
    });
  }

  onSubmit() {
    if (this.registerForm.invalid) return;

    // Extract the form values
    const { firstName, lastName, username, email, password, role } = this.registerForm.value;

    // Pass individual parameters to the register method
    this.authService.register(firstName, lastName, username, email, password, role).subscribe({
      next: (response: AuthResponse) => {
        this.authService.storeUserData(response);
        this.snackBar.open('Registration Successful', 'Close', { duration: 3000 });
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.snackBar.open('Registration Failed', 'Close', { duration: 5000 });
        this.errorMessage = 'Registration failed';
      }
    });
  }
  }

  // registerForm = this.fb.group({
  //   firstName: ['', Validators.required],
  //   lastName: ['', Validators.required],
  //   username: ['', Validators.required],
  //   email: ['', [Validators.required, Validators.email]],
  //   password: ['', [Validators.required, Validators.minLength(6)]],
  //   role: ['ROLE_USER', Validators.required]
  // });

  // constructor(
  //   private fb: FormBuilder,
  //   private authService: AuthService,
  //   private snackBar: MatSnackBar,
  //   private router: Router
  // ) {}

  // onSubmit() {
  //   if (this.registerForm.invalid) return;

  //   const { 
  //     firstName = '', 
  //     lastName = '', 
  //     username = '', 
  //     email = '', 
  //     password = '', 
  //     role = 'ROLE_USER' 
  //   } = this.registerForm.value;

  //   this.authService.register(
  //     firstName as string, 
  //     lastName as string, 
  //     username as string, 
  //     email as string, 
  //     password as string, 
  //     role as string
  //   ).subscribe(
  //     (response) => {
  //       this.snackBar.open('Registration successful!', 'Close', { duration: 3000 });
  //       this.router.navigate(['/login']);
  //     },
  //     (error) => {
  //       this.snackBar.open('Registration failed. Please try again.', 'Close', { duration: 3000 });
  //     }
  //   );
  // }


