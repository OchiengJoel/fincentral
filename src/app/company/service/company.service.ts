import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import { Company, CompanyPage } from '../model/company';
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

  // Helper method to set authorization headers
  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders().set('Authorization', `Bearer ${this.authService.getAccessToken()}`);
  }


  getCompanies(): Observable<CompanyPage> {
    return this.http.get<CompanyPage>(`${this.apiUrl}/list`, { headers: this.getAuthHeaders() }).pipe(
      catchError((error) => this.handleError('Failed to load companies', error))
    );
  }

  // Create a new company
  createCompany(company: Company): Observable<Company> {
    return this.http.post<Company>(`${this.apiUrl}/create`, company, { headers: this.getAuthHeaders() }).pipe(
      catchError((error) => this.handleError('Failed to create company', error))
    );
  }

  // Update an existing company
  updateCompany(company: Company): Observable<Company> {
    return this.http.put<Company>(`${this.apiUrl}/update/${company.id}`, company, { headers: this.getAuthHeaders() }).pipe(
      catchError((error) => this.handleError('Failed to update company', error))
    );
  }

  // Fetch a company by ID
  getCompanyById(id: number): Observable<Company> {
    return this.http.get<Company>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() }).pipe(
      catchError((error) => this.handleError('Failed to fetch company details', error))
    );
  }

  // Delete a company
  deleteCompany(companyId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${companyId}`, { headers: this.getAuthHeaders() }).pipe(
      catchError((error) => this.handleError('Failed to delete company', error))
    );
  }

  // Enable company
  enableCompany(id: number): Observable<Company> {
    return this.http.patch<Company>(`${this.apiUrl}/${id}/enable`, {}, {
      headers: this.getAuthHeaders(),
    }).pipe(
      catchError((error) => {
        this.snackBar.open('Failed to enable company: ' + error.message, 'Close', { duration: 5000 });
        throw error;
      })
    );
  }

  // Disable company
  disableCompany(id: number): Observable<Company> {
    return this.http.patch<Company>(`${this.apiUrl}/${id}/disable`, {}, {
      headers: this.getAuthHeaders(),
    }).pipe(
      catchError((error) => {
        this.snackBar.open('Failed to disable company: ' + error.message, 'Close', { duration: 5000 });
        throw error;
      })
    );
  }

  // Helper method to handle errors and show snackbar
  private handleError(message: string, error: any): Observable<never> {
    this.snackBar.open(message, 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
    console.error(error); // Log the error for debugging
    throw error;
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


 // Fetch all companies
  // getCompanies(page: number, size: number): Observable<any> {
  //   const headers = new HttpHeaders().set('Authorization', `Bearer ${this.authService.getAccessToken()}`);
  //   return this.http.get<any>(`${this.apiUrl}/list?page=${page}&size=${size}`, { headers }).pipe(
  //     catchError((error) => {
  //       this.snackBar.open('Failed to load companies', 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
  //       throw error;
  //     })
  //   );
  // }