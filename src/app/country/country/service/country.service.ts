import { Injectable } from '@angular/core';
import { Country, CountryPage } from '../model/country';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, catchError } from 'rxjs';
import { AuthService } from 'src/app/auth/service/auth.service';

@Injectable({
  providedIn: 'root'
})
export class CountryService {

   private apiUrl = `http://localhost:8080/api/v2/countries`;
   
  
    constructor(
      private http: HttpClient,
      private snackBar: MatSnackBar,
      private authService: AuthService
    ) {}
  
    // Helper method to set authorization headers
    private getAuthHeaders(): HttpHeaders {
      return new HttpHeaders().set('Authorization', `Bearer ${this.authService.getAccessToken()}`);
    }
  
    // Get all companies
    // getCompanies(): Observable<Company[]> {
    //   return this.http.get<Company[]>(`${this.apiUrl}/list`, { headers: this.getAuthHeaders() }).pipe(
    //     // Uncomment to log data for debugging (remove in production)
    //     // tap(data => console.log('Companies fetched from service:', data)),
    //     catchError((error) => this.handleError('Failed to load companies', error))
    //   );
    // }
  
    getCountries(): Observable<CountryPage> {
      return this.http.get<CountryPage>(`${this.apiUrl}/list`, { headers: this.getAuthHeaders() }).pipe(
        catchError((error) => {
          this.snackBar.open('Failed to load countries', 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
          throw error;
        })
      );
    }
  
  
    // Create a new company
    createCountry(country: Country): Observable<Country> {
      return this.http.post<Country>(`${this.apiUrl}/create`, country, { headers: this.getAuthHeaders() }).pipe(
        catchError((error) => {
          this.snackBar.open('Failed to create country', 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
          throw error;
        })
      );
    }
  
    // Update an existing company
    updateCountry(country: Country): Observable<Country> {
      return this.http.put<Country>(`${this.apiUrl}/update/${country.id}`, country, { headers: this.getAuthHeaders() }).pipe(
        catchError((error) => {
          this.snackBar.open('Failed to update country', 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
          throw error;
        })
      );
    }
  
    // Fetch a company by ID
    getCountryById(id: number): Observable<Country> {
      return this.http.get<Country>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() }).pipe(
        catchError((error) => {
          this.snackBar.open('Failed to fetch country details', 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
          throw error;
        })
      );
    }
  
  
    // Delete a company
    deleteCountry(countryId: number): Observable<void> {
      return this.http.delete<void>(`${this.apiUrl}/${countryId}`, { headers: this.getAuthHeaders() }).pipe(
        catchError((error) => {
          this.snackBar.open('Failed to delete country', 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
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
}
