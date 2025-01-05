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
  private selectedCompanySubject = new BehaviorSubject<number | null>(null);
  public selectedCompanyId$ = this.selectedCompanySubject.asObservable();

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

  // Update a company
  updateCompany(company: Company): Observable<Company> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.authService.getAccessToken()}`);
    return this.http.put<Company>(`${this.apiUrl}/update/${company.id}`, company, { headers }).pipe(
      catchError((error) => {
        this.snackBar.open('Failed to update company', 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
        throw error;
      })
    );
  }

  // Fetch a company by ID
  getCompanyById(id: number): Observable<Company> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.authService.getAccessToken()}`);
    return this.http.get<Company>(`${this.apiUrl}/${id}`, { headers }).pipe(
      catchError((error) => {
        this.snackBar.open('Failed to fetch company details', 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
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

  // Switch the selected company
  switchCompany(companyId: number): void {
    this.selectedCompanySubject.next(companyId);
    localStorage.setItem('selectedCompanyId', companyId.toString());
  }

  // Get the selected company ID
  getSelectedCompanyId(): Observable<number | null> {
    const storedCompanyId = localStorage.getItem('selectedCompanyId');
    if (storedCompanyId) {
      this.selectedCompanySubject.next(Number(storedCompanyId));
    }
    return this.selectedCompanyId$;
  }
}