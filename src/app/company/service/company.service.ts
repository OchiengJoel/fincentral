import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import { Company } from '../model/company';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/auth/service/auth.service';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {

   private apiUrl = `http://localhost:8080/api/v2/companies`;

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {}

  // Fetch all companies
  getCompanies(page: number, size: number): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.authService.getAccessToken()}`);
    return this.http.get<any>(`${this.apiUrl}/list?page=${page}&size=${size}`, { headers }).pipe(
      catchError((error) => {
        this.snackBar.open('Failed to load companies', 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
        throw error;
      })
    );
  }

  // Create a new company
  createCompany(company: Company): Observable<Company> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.authService.getAccessToken()}`);
    return this.http.post<Company>(`${this.apiUrl}/create`, company, { headers }).pipe(
      catchError((error) => {
        this.snackBar.open('Failed to create company', 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
        throw error;
      })
    );
  }

  // Delete a company
  deleteCompany(companyId: number): Observable<void> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.authService.getAccessToken()}`);
    return this.http.delete<void>(`${this.apiUrl}/${companyId}`, { headers }).pipe(
      catchError((error) => {
        this.snackBar.open('Failed to delete company', 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
        throw error;
      })
    );
  }
}
