import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import { Company } from '../model/company';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {

  private baseUrl: string;
  private readonly LOCAL_STORAGE_KEY = 'selectedCompanyId';
  private selectedCompanyId: BehaviorSubject<number | null>;

  constructor(
    private http: HttpClient
  ) {

    this.baseUrl= 'http://localhost:8080/api/v2/companies';
    const storedCompanyId = localStorage.getItem(this.LOCAL_STORAGE_KEY);
    this.selectedCompanyId = new BehaviorSubject<number | null>(storedCompanyId ? +storedCompanyId : null);  
   }

  //  getCompanies(): Observable<Company[]> {
  //   return this.http.get<Company[]>(`${this.baseUrl}/list`).pipe(
  //     catchError(this.handleError)
  //   );
  // }

  getCompanies(): Observable<Company[]> {
    return this.http.get<Company[]>(`${this.baseUrl}/list`).pipe(
      tap(data => console.log('Companies fetched from service:', data)), // Add this line
      catchError(this.handleError)
    );
  }

  getCompanyById(id: number): Observable<Company> {
    return this.http.get<Company>(`${this.baseUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createCompany(company: Company): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/save`, company).pipe(
      catchError(this.handleError)
    );
  }


  //  updateCompany(id: number, company: Company ):Observable<Company>{
  //   return this.http.put<Company>(`${this.baseUrl}/update/${id}`, company)
  //  }

  updateCompany(company: Company): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/update/${company.id}`, company).pipe(
      catchError(this.handleError)
    );
  }

  deleteCompany(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/delete/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  getSelectedCompanyId(): Observable<number | null> {
    return this.selectedCompanyId.asObservable();
  }

  switchCompany(companyId: number): void {
    localStorage.setItem(this.LOCAL_STORAGE_KEY, companyId.toString());
    this.selectedCompanyId.next(companyId);
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Unknown error!';
    if (error.error instanceof ErrorEvent) {
      // Client-side errors
      errorMessage = `Client-side Error: ${error.error.message}`;
    } else {
      // Server-side errors
      errorMessage = `Server-side Error: Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage); // Log error message to console for debugging
    return throwError(errorMessage);
  }
}
