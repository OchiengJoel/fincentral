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

  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders().set('Authorization', `Bearer ${this.authService.getAccessToken()}`);
  }

  // Get all countries
  getCountries(): Observable<CountryPage> {
    return this.http.get<CountryPage>(`${this.apiUrl}/list`, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError('Failed to load countries'))
    );
  }

  // Create a new country
  createCountry(country: Country): Observable<Country> {
    return this.http.post<Country>(`${this.apiUrl}/create`, country, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError('Failed to create country'))
    );
  }

  // Update an existing country
  updateCountry(country: Country): Observable<Country> {
    return this.http.put<Country>(`${this.apiUrl}/update/${country.id}`, country, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError('Failed to update country'))
    );
  }

  // Fetch country by ID
  getCountryById(id: number): Observable<Country> {
    return this.http.get<Country>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError('Failed to fetch country details'))
    );
  }

  // Delete a country
  deleteCountry(countryId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${countryId}`, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError('Failed to delete country'))
    );
  }

  // Handle errors and show snackbar
  private handleError(message: string) {
    return (error: any) => {
      this.snackBar.open(message, 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
      console.error(error); // Log the error for debugging
      throw error;
    };
  }
}
