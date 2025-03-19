import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, throwError } from 'rxjs';
import { InventoryItem, PaginatedResponse } from '../model/inventory-item';
import { AuthService } from 'src/app/auth/service/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class InventoryItemService {

  private apiUrl = 'http://localhost:8080/api/v2/inventoryitem';
  private selectedCompanySubject = new BehaviorSubject<number | null>(null);
  public selectedCompanyId$ = this.selectedCompanySubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders().set('Authorization', `Bearer ${this.authService.getAccessToken()}`);
  }

  createInventoryItem(inventoryItem: InventoryItem, itemCategoryId: number): Observable<InventoryItem> {
    const headers = this.getAuthHeaders();
    const params = new HttpParams().set('itemCategoryId', itemCategoryId.toString());
    return this.http.post<InventoryItem>(`${this.apiUrl}/create`, inventoryItem, { headers, params })
      .pipe(catchError(this.handleError('Failed to create inventory item')));
  }

  getAllInventoryItems(page: number, size: number): Observable<PaginatedResponse<InventoryItem>> {
    const headers = this.getAuthHeaders();
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PaginatedResponse<InventoryItem>>(`${this.apiUrl}/list`, { headers, params })
      .pipe(catchError(this.handleError('Failed to load inventory items')));
  }

  getInventoryItemById(id: number): Observable<InventoryItem> {
    const headers = this.getAuthHeaders();
    return this.http.get<InventoryItem>(`${this.apiUrl}/${id}`, { headers })
      .pipe(catchError(this.handleError('Failed to load inventory item')));
  }

  update(id: number, inventoryItem: InventoryItem, itemCategoryId: number): Observable<InventoryItem> {
    const headers = this.getAuthHeaders();
    const url = `${this.apiUrl}/update/${id}?itemCategoryId=${itemCategoryId}`;
    return this.http.put<InventoryItem>(url, inventoryItem, { headers })
      .pipe(catchError(this.handleError('Failed to update inventory item')));
  }

  deleteInventoryItem(id: number): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers })
      .pipe(catchError(this.handleError('Failed to delete inventory item')));
  }

  private handleError(message: string): (error: any) => Observable<never> {
    return (error: any) => {
      const errorMessage = `${message}: ${error.error?.message || error.message || 'Unknown error'}`;
      this.snackBar.open(errorMessage, 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
      console.error(errorMessage, error);
      return throwError(() => new Error(errorMessage));
    };
  }
}



// createInventoryItem(inventoryItem: InventoryItem): Observable<InventoryItem> {
  //   const headers = this.getAuthHeaders();
  //   return this.http.post<InventoryItem>(`${this.apiUrl}/create?itemCategoryId=${inventoryItem.itemCategoryId}`, inventoryItem, { headers })
  //     .pipe(catchError((error) => this.handleError('Failed to create company', error)));
  // }

  // Read all items with pagination
  // getAllInventoryItems(page: number, size: number): Observable<any> {
  //   const params = new HttpParams()
  //     .set('page', page.toString())
  //     .set('size', size.toString());

  //   return this.http
  //     .get<any>(`${this.apiUrl}/list`, { params })
  //     .pipe(catchError(this.handleError));  // Add error handling here
  // }


  // Updated update method to include itemCategoryId in the URL
  // updateInventoryItem(id: number, inventoryItem: InventoryItem): Observable<InventoryItem> {
  //   const headers = this.getAuthHeaders();
  //   return this.http
  //     .put<InventoryItem>(`${this.apiUrl}/update/${id}?itemCategoryId=${inventoryItem.itemCategoryId}`, inventoryItem, { headers })
  //     .pipe(catchError(this.handleError));
  // }

