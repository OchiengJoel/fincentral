import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { BehaviorSubject, catchError, map, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { AuthResponse } from '../model/auth-response';
import { User } from '../model/user';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8080/api/v2/auth';

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  // Login method with AuthResponse type
  login(username: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, { username, password })
      .pipe(
        catchError((error) => {
          this.snackBar.open('Login failed: ' + error.message, 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar'],
          });
          throw error;
        })
      );
  }

  // Register method with AuthResponse type
  register(
    firstName: string,
    lastName: string,
    username: string,
    email: string,
    password: string,
    role: string
  ): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register`, {
        firstName,
        lastName,
        username,
        email,
        password,
        role,
      })
      .pipe(
        catchError((error) => {
          this.snackBar.open('Registration failed: ' + error.message, 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar'],
          });
          throw error;
        })
      );
  }

  // Store tokens in sessionStorage and HTTP-only cookies
  storeUserData(authResponse: AuthResponse): void {
    // Access token stored in memory
    sessionStorage.setItem('access_token', authResponse.access_token);

    // Refresh token stored as HTTP-only cookie (backend should set this)
    //document.cookie = `refresh_token=${authResponse.refresh_token}; HttpOnly; Secure; SameSite=Strict; path=/`;

    // Additional user data in sessionStorage (or any other secure method)
    sessionStorage.setItem('user', JSON.stringify(authResponse));
  }

  // Fetch user data
  getUserData() {
    return JSON.parse(sessionStorage.getItem('user') || '{}');
  }

  // Retrieve access token from sessionStorage
  getAccessToken(): string | null {
    return sessionStorage.getItem('access_token');
  }

  // Check if the user is authenticated
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  // Handle refresh token logic
  refreshAccessToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshTokenFromCookie();
    if (!refreshToken) {
      this.snackBar.open('Refresh token not found', 'Close', { duration: 5000 });
      return of({
        access_token: '',
        refresh_token: '',
        message: 'No refresh token found',
        email: '',
        firstName: '',
        lastName: '',
        roles: [],
        companies: [],
        defaultCompany: 'No default company',  // Provide a default value
      });
    }
  
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/refresh`, { refresh_token: refreshToken })
      .pipe(
        switchMap((response: AuthResponse) => {
          if (this.isTokenExpired(response.access_token)) {
            this.snackBar.open('Access token has expired. Please log in again.', 'Close', { duration: 5000 });
            this.logout();
            return of({
              access_token: '',
              refresh_token: '',
              message: 'Session expired, please log in again',
              email: '',
              firstName: '',
              lastName: '',
              roles: [],
              companies: [],
              defaultCompany: 'No default company',  // Fallback for missing defaultCompany
            });
          }
  
          this.storeUserData(response);  // Store the new access token and refresh token
          return of(response);  // Return the updated response
        }),
        catchError((error) => {
          this.snackBar.open('Session expired. Please log in again.', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar'],
          });
          this.logout();
          return of({
            access_token: '',
            refresh_token: '',
            message: 'Session expired, please log in again',
            email: '',
            firstName: '',
            lastName: '',
            roles: [],
            companies: [],
            defaultCompany: 'No default company',  // Fallback value in case of error
          });
        })
      );
  }
  
  // Utility method to check if the token is expired
  private isTokenExpired(token: string): boolean {
    const payload = this.decodeJwt(token);
    const expiryDate = payload?.exp ? new Date(payload.exp * 1000) : null;
    return expiryDate ? expiryDate < new Date() : true;
  }
  
  // Utility method to decode JWT token and get the payload
  private decodeJwt(token: string): any {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload)); // Decode and parse the payload
  }

  // Retrieve refresh token from cookie (since it's HTTP-only, it cannot be accessed via JS directly)
  private getRefreshTokenFromCookie(): string | null {
    const name = 'refresh_token=';
    const decodedCookie = document.cookie;
    const ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') c = c.substring(1);
      if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return null;
  }

  // Logout and clear all data
  logout(): void {
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('user');
    document.cookie = 'refresh_token=; Max-Age=-99999999;'; // Delete the cookie
    this.router.navigate(['/login']);
  }

  switchCompany(companyId: number): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/switch_company`, { companyId })
        .pipe(
            tap((response: AuthResponse) => {
                this.storeUserData(response); // Update tokens and user data
                this.snackBar.open(`Switched to ${response.defaultCompany}`, 'Close', { duration: 3000 });
            }),
            catchError((error) => {
                this.snackBar.open('Company switch failed: ' + error.message, 'Close', { duration: 5000 });
                throw error;
            })
        );
}
}




  // private apiUrl = 'http://localhost:8080/api/v2/auth'; // Backend API URL
  // private currentUserSubject: BehaviorSubject<any>;
  // public currentUser: Observable<any>;

  // constructor(private http: HttpClient, private router: Router) {
  //   // Check if 'currentUser' exists in localStorage before parsing
  //   const currentUser = localStorage.getItem('currentUser');
  //   this.currentUserSubject = new BehaviorSubject<any>(currentUser ? JSON.parse(currentUser) : null); // Initialize with null if not found
  //   this.currentUser = this.currentUserSubject.asObservable();
  // }

  // login(username: string, password: string) {
  //   return this.http.post<any>(`${this.apiUrl}/login`, { username, password })
  //     .pipe(
  //       map(response => {
  //         // Store JWT tokens
  //         localStorage.setItem('access_token', response.access_token);
  //         localStorage.setItem('refresh_token', response.refresh_token);
  //         localStorage.setItem('currentUser', JSON.stringify(response));
  //         this.currentUserSubject.next(response);
  //         return response;
  //       }),
  //       catchError(this.handleError) // Fix here
  //     );
  // }

  // register(user: any) {
  //   return this.http.post<any>(`${this.apiUrl}/register`, user)
  //     .pipe(
  //       map(response => {
  //         localStorage.setItem('access_token', response.access_token);
  //         localStorage.setItem('refresh_token', response.refresh_token);
  //         localStorage.setItem('currentUser', JSON.stringify(response));
  //         this.currentUserSubject.next(response);
  //         return response;
  //       }),
  //       catchError(this.handleError) // Fix here
  //     );
  // }

  // logout() {
  //   localStorage.removeItem('access_token');
  //   localStorage.removeItem('refresh_token');
  //   localStorage.removeItem('currentUser');
  //   this.currentUserSubject.next(null);
  //   this.router.navigate(['/login']);
  // }

  // getUserDetails(): Observable<any> {
  //   const accessToken = localStorage.getItem('access_token');
  //   const headers = new HttpHeaders().set('Authorization', `Bearer ${accessToken}`);
  //   return this.http.get<any>(`${this.apiUrl}/user_details`, { headers })
  //     .pipe(catchError(this.handleError)); // Fix here
  // }

  // // Error handling method that returns an observable
  // private handleError(error: any) {
  //   console.error('An error occurred:', error); // Log the error for debugging

  //   // You can customize the error message or error handling here
  //   // Return an observable with a user-friendly message or rethrow the error
  //   return throwError(() => new Error('Something went wrong. Please try again later.'));
  // }




  // private apiUrl = 'http://localhost:8080/api/v2/auth'; // Backend API URL
  // private jwtHelper = new JwtHelperService();
  // private currentUserSubject: BehaviorSubject<any>;
  // public currentUser: Observable<any>;

  // constructor(private http: HttpClient, private router: Router) {
  //   this.currentUserSubject = new BehaviorSubject<any>(JSON.parse(localStorage.getItem('currentUser')!));
  //   this.currentUser = this.currentUserSubject.asObservable();
  // }

  // // Get current user value
  // public get currentUserValue() {
  //   return this.currentUserSubject.value;
  // }

  // login(username: string, password: string) {
  //   return this.http.post<any>(`${this.apiUrl}/login`, { username, password })
  //     .pipe(
  //       map(response => {
  //         if (response && response.access_token) {
  //           // Assuming response contains a 'user' object
  //           const user = response.user;
  //           // Store the user details and JWT token in localStorage
  //           localStorage.setItem('currentUser', JSON.stringify(user));
  //           this.currentUserSubject.next(user);  // Populate current user details
  //         }
  //         return response;
  //       }),
  //       catchError(this.handleError)
  //     );
  // }

  // // Register method
  // register(firstName: string, lastName: string, username: string, email: string, password: string, role: string) {
  //   return this.http.post<any>(`${this.apiUrl}/register`, { firstName, lastName, username, email, password, role })
  //     .pipe(
  //       map(response => {
  //         return response;
  //       }),
  //       catchError(this.handleError)  // Using the fixed handleError method
  //     );
  // }

  // // Logout method
  // logout() {
  //   // Remove user from local storage and reset the current user observable
  //   localStorage.removeItem('currentUser');
  //   this.currentUserSubject.next(null);
  //   this.router.navigate(['/login']);
  // }

  // // Check if the token is expired
  // isTokenExpired(token: string): boolean {
  //   return this.jwtHelper.isTokenExpired(token);
  // }

  // private handleError(error: any) {
  //   console.error(error);
  //   return throwError(() => new Error(error));  // Corrected error handling
  // }

