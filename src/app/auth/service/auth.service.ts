import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
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
  private companySwitchedSubject = new BehaviorSubject<number | null>(null);
  public companySwitched$: Observable<number | null> = this.companySwitchedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    // Initialize company ID from local storage if available
    const storedCompanyId = localStorage.getItem('selectedCompanyId');
    if (storedCompanyId) {
      this.companySwitchedSubject.next(+storedCompanyId);
    }
  }

  /**
   * Logs in a user and stores authentication data.
   * @param username User's username.
   * @param password User's password.
   * @returns Observable of AuthResponse.
   */
  login(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { username, password }, { withCredentials: true })
      .pipe(
        tap(response => {
          this.storeUserData(response);
          this.companySwitchedSubject.next(response.companyIds?.[0] || null);
        }),
        catchError(this.handleError('Login failed', 'Invalid credentials', 401))
      );
  }

  /**
   * Registers a new user and stores authentication data.
   * @param firstName User's first name.
   * @param lastName User's last name.
   * @param username User's username.
   * @param email User's email.
   * @param password User's password.
   * @param role User's role (optional).
   * @returns Observable of AuthResponse.
   */
  register(firstName: string, lastName: string, username: string, email: string, password: string, role?: string): Observable<AuthResponse> {
    const body = { firstName, lastName, username, email, password, role };
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, body, { withCredentials: true })
      .pipe(
        tap(response => {
          this.storeUserData(response);
          this.companySwitchedSubject.next(response.companyIds?.[0] || null);
        }),
        catchError(this.handleError('Registration failed', 'User already exists', 409))
      );
  }

  /**
   * Switches the active company and updates tokens.
   * @param companyId The ID of the company to switch to.
   * @returns Observable of AuthResponse.
   */
  switchCompany(companyId: number): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/switch_company`, { companyId }, { withCredentials: true })
      .pipe(
        tap(response => {
          this.storeUserData(response);
          localStorage.setItem('selectedCompanyId', companyId.toString());
          this.companySwitchedSubject.next(companyId);
          this.snackBar.open(`Switched to ${response.defaultCompany}`, 'Close', { duration: 3000 });
        }),
        catchError(this.handleError('Company switch failed'))
      );
  }

  /**
   * Refreshes the access token using the refresh token cookie.
   * @returns Observable of AuthResponse.
   */
  refreshAccessToken(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh_token`, null, { withCredentials: true })
      .pipe(
        tap(response => this.storeUserData(response)),
        catchError(() => {
          this.snackBar.open('Session expired. Please log in again.', 'Close', { duration: 5000 });
          this.logout();
          return of({ access_token: '', refresh_token: '', message: 'Session expired', email: '', firstName: '', lastName: '', roles: [], companies: [], defaultCompany: '' });
        })
      );
  }

  /**
   * Stores user data and tokens in sessionStorage.
   * @param authResponse The authentication response from the backend.
   */
  public storeUserData(authResponse: AuthResponse): void {
    sessionStorage.setItem('access_token', authResponse.access_token);
    sessionStorage.setItem('user', JSON.stringify(authResponse));
  }

  /**
   * Retrieves stored user data.
   * @returns AuthResponse object or empty object if not found.
   */
  getUserData(): AuthResponse {
    return JSON.parse(sessionStorage.getItem('user') || '{}');
  }

  /**
   * Gets the current access token.
   * @returns Access token string or null if not present.
   */
  getAccessToken(): string | null {
    return sessionStorage.getItem('access_token');
  }

  /**
   * Checks if the user is authenticated.
   * @returns True if an access token exists.
   */
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  /**
   * Checks if the token is expired.
   * @param token The JWT token to check.
   * @returns True if expired or invalid.
   */
  isTokenExpired(token: string): boolean {
    const payload = this.decodeJwt(token);
    const expiryDate = payload?.exp ? new Date(payload.exp * 1000) : null;
    return expiryDate ? expiryDate < new Date() : true;
  }

  /**
   * Decodes a JWT token to extract its payload.
   * @param token The JWT token.
   * @returns Decoded payload or null if invalid.
   */
  private decodeJwt(token: string): any {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch (e) {
      return null;
    }
  }

  /**
   * Logs out the user and clears storage.
   */
  logout(): void {
    sessionStorage.clear();
    localStorage.removeItem('selectedCompanyId');
    this.companySwitchedSubject.next(null);
    this.router.navigate(['/login']);
  }

  /**
   * Handles HTTP errors with custom messages.
   * @param defaultMessage Default error message.
   * @param specificMessage Specific message for a given status code.
   * @param statusCode Optional status code to trigger specific message.
   * @returns Error handler function.
   */
  private handleError(defaultMessage: string, specificMessage?: string, statusCode?: number) {
    return (error: HttpErrorResponse): Observable<never> => {
    const message = (statusCode && error.status === statusCode)? (specificMessage ?? defaultMessage): `${defaultMessage}: ${error.message || 'Unknown error'}`;
      this.snackBar.open(message, 'Close', { duration: 5000 });
      return throwError(() => error);
    };
  }

  
}



 // login(username: string, password: string): Observable<AuthResponse> {
  //   return this.http
  //     .post<AuthResponse>(`${this.apiUrl}/login`, { username, password })
  //     .pipe(
  //       catchError((error) => {
  //         this.snackBar.open('Login failed: ' + error.message, 'Close', {
  //           duration: 5000,
  //           panelClass: ['error-snackbar'],
  //         });
  //         throw error;
  //       })
  //     );
  // }
  
  // register(
  //   firstName: string,
  //   lastName: string,
  //   username: string,
  //   email: string,
  //   password: string,
  //   role: string
  // ): Observable<AuthResponse> {
  //   return this.http
  //     .post<AuthResponse>(`${this.apiUrl}/register`, {
  //       firstName,
  //       lastName,
  //       username,
  //       email,
  //       password,
  //       role,
  //     })
  //     .pipe(
  //       catchError((error) => {
  //         this.snackBar.open('Registration failed: ' + error.message, 'Close', {
  //           duration: 5000,
  //           panelClass: ['error-snackbar'],
  //         });
  //         throw error;
  //       })
  //     );
  // }


//   storeUserData(authResponse: AuthResponse): void {
//     // Access token stored in memory
//     sessionStorage.setItem('access_token', authResponse.access_token);

//     // Refresh token stored as HTTP-only cookie (backend should set this)
//     //document.cookie = `refresh_token=${authResponse.refresh_token}; HttpOnly; Secure; SameSite=Strict; path=/`;

//     // Additional user data in sessionStorage (or any other secure method)
//     sessionStorage.setItem('user', JSON.stringify(authResponse));
//   }

//   // Fetch user data
//   getUserData() {
//     return JSON.parse(sessionStorage.getItem('user') || '{}');
//   }

//   // Retrieve access token from sessionStorage
//   getAccessToken(): string | null {
//     return sessionStorage.getItem('access_token');
//   }

//   // Check if the user is authenticated
//   isAuthenticated(): boolean {
//     return !!this.getAccessToken();
//   }

//   // Handle refresh token logic
//   refreshAccessToken(): Observable<AuthResponse> {
//     const refreshToken = this.getRefreshTokenFromCookie();
//     if (!refreshToken) {
//       this.snackBar.open('Refresh token not found', 'Close', { duration: 5000 });
//       return of({
//         access_token: '',
//         refresh_token: '',
//         message: 'No refresh token found',
//         email: '',
//         firstName: '',
//         lastName: '',
//         roles: [],
//         companies: [],
//         defaultCompany: 'No default company',  // Provide a default value
//       });
//     }
  
//     return this.http
//       .post<AuthResponse>(`${this.apiUrl}/refresh`, { refresh_token: refreshToken })
//       .pipe(
//         switchMap((response: AuthResponse) => {
//           if (this.isTokenExpired(response.access_token)) {
//             this.snackBar.open('Access token has expired. Please log in again.', 'Close', { duration: 5000 });
//             this.logout();
//             return of({
//               access_token: '',
//               refresh_token: '',
//               message: 'Session expired, please log in again',
//               email: '',
//               firstName: '',
//               lastName: '',
//               roles: [],
//               companies: [],
//               defaultCompany: 'No default company',  // Fallback for missing defaultCompany
//             });
//           }
  
//           this.storeUserData(response);  // Store the new access token and refresh token
//           return of(response);  // Return the updated response
//         }),
//         catchError((error) => {
//           this.snackBar.open('Session expired. Please log in again.', 'Close', {
//             duration: 5000,
//             panelClass: ['error-snackbar'],
//           });
//           this.logout();
//           return of({
//             access_token: '',
//             refresh_token: '',
//             message: 'Session expired, please log in again',
//             email: '',
//             firstName: '',
//             lastName: '',
//             roles: [],
//             companies: [],
//             defaultCompany: 'No default company',  // Fallback value in case of error
//           });
//         })
//       );
//   }
  
//   // Utility method to check if the token is expired
//   private isTokenExpired(token: string): boolean {
//     const payload = this.decodeJwt(token);
//     const expiryDate = payload?.exp ? new Date(payload.exp * 1000) : null;
//     return expiryDate ? expiryDate < new Date() : true;
//   }
  
//   // Utility method to decode JWT token and get the payload
//   private decodeJwt(token: string): any {
//     const payload = token.split('.')[1];
//     return JSON.parse(atob(payload)); // Decode and parse the payload
//   }

//   // Retrieve refresh token from cookie (since it's HTTP-only, it cannot be accessed via JS directly)
//   private getRefreshTokenFromCookie(): string | null {
//     const name = 'refresh_token=';
//     const decodedCookie = document.cookie;
//     const ca = decodedCookie.split(';');
//     for (let i = 0; i < ca.length; i++) {
//       let c = ca[i];
//       while (c.charAt(0) == ' ') c = c.substring(1);
//       if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
//     }
//     return null;
//   }

//   // Logout and clear all data
//   logout(): void {
//     sessionStorage.removeItem('access_token');
//     sessionStorage.removeItem('user');
//     document.cookie = 'refresh_token=; Max-Age=-99999999;'; // Delete the cookie
//     this.router.navigate(['/login']);
//   }

//   switchCompany(companyId: number): Observable<AuthResponse> {
//     return this.http.post<AuthResponse>(`${this.apiUrl}/switch_company`, { companyId })
//         .pipe(
//             tap((response: AuthResponse) => {
//                 this.storeUserData(response); // Update tokens and user data
//                 this.snackBar.open(`Switched to ${response.defaultCompany}`, 'Close', { duration: 3000 });
//             }),
//             catchError((error) => {
//                 this.snackBar.open('Company switch failed: ' + error.message, 'Close', { duration: 5000 });
//                 throw error;
//             })
//         );
// }










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

