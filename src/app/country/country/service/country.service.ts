import { Injectable } from '@angular/core';
import { Country, CountryPage } from '../model/country';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, Observable, catchError } from 'rxjs';
import { AuthService } from 'src/app/auth/service/auth.service';

@Injectable({
  providedIn: 'root'
})
export class CountryService {
  private apiUrl = `http://localhost:8080/api/v2/countries`;

  private countriesSubject: BehaviorSubject<Country[]> = new BehaviorSubject<Country[]>([]);  // To cache the countries
  public countries$: Observable<Country[]> = this.countriesSubject.asObservable();  // Expose the observable

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {}

  // Auth headers for API requests
  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders().set('Authorization', `Bearer ${this.authService.getAccessToken()}`);
  }

  // Get all countries (loads the list and caches it)
  getCountries(): Observable<Country[]> {
    // Check if the countries are already cached
    if (this.countriesSubject.value.length === 0) {
      // If not cached, load from API
      this.loadCountriesFromApi();
    }
    return this.countries$;  // Return the cached observable
  }

  // Load countries from API and cache them
  private loadCountriesFromApi(): void {
    this.http.get<CountryPage>(`${this.apiUrl}/list`, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError('Failed to load countries'))
    ).subscribe(
      (response) => {
        this.countriesSubject.next(response.content);  // Cache the countries array in the BehaviorSubject
      },
      (error) => {
        this.snackBar.open('Failed to load countries', 'Close', { duration: 5000 });
      }
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
