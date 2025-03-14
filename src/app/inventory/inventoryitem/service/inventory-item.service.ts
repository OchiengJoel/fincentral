import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable } from 'rxjs';
import { InventoryItem, PaginatedResponse } from '../model/inventory-item';
import { AuthService } from 'src/app/auth/service/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class InventoryItemService {

  private apiUrl = `http://localhost:8080/api/v2/inventoryitem`;  // Ensure correct base URL
  private selectedCompanySubject = new BehaviorSubject<number | null>(null);
  public selectedCompanyId$ = this.selectedCompanySubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) { }

  // Helper method for authorization headers
  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders().set('Authorization', `Bearer ${this.authService.getAccessToken()}`);
  }

  // createInventoryItem(inventoryItem: InventoryItem): Observable<InventoryItem> {
  //   const headers = this.getAuthHeaders();
  //   return this.http.post<InventoryItem>(`${this.apiUrl}/create?itemCategoryId=${inventoryItem.itemCategoryId}`, inventoryItem, { headers })
  //     .pipe(catchError((error) => this.handleError('Failed to create company', error)));
  // }

  createInventoryItem(inventoryItem: InventoryItem, itemCategoryId: number): Observable<InventoryItem> {
    const headers = this.getAuthHeaders();
    // Create the query parameters for the itemCategoryId
    const params = new HttpParams().set('itemCategoryId', itemCategoryId.toString());

    // Send the inventory item data as the request body
    return this.http.post<InventoryItem>(`${this.apiUrl}/create`, inventoryItem, { params })
      .pipe(catchError(this.handleError));
  }

  // Read all items with pagination
  // getAllInventoryItems(page: number, size: number): Observable<any> {
  //   const params = new HttpParams()
  //     .set('page', page.toString())
  //     .set('size', size.toString());

  //   return this.http
  //     .get<any>(`${this.apiUrl}/list`, { params })
  //     .pipe(catchError(this.handleError));  // Add error handling here
  // }

  // Get all inventory items with pagination
  getAllInventoryItems(page: number, size: number): Observable<InventoryItem[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
  
    return this.http.get<PaginatedResponse<InventoryItem>>(`${this.apiUrl}/list`, { params }).pipe(
      map(response => response.items),  // Extract the 'items' array from the response
      catchError(this.handleError)
    );
  }
  

  // Get single item by ID
  getInventoryItemById(id: number): Observable<InventoryItem> {
    return this.http
      .get<InventoryItem>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));  // Add error handling here
  }

  // Updated update method to include itemCategoryId in the URL
  // updateInventoryItem(id: number, inventoryItem: InventoryItem): Observable<InventoryItem> {
  //   const headers = this.getAuthHeaders();
  //   return this.http
  //     .put<InventoryItem>(`${this.apiUrl}/update/${id}?itemCategoryId=${inventoryItem.itemCategoryId}`, inventoryItem, { headers })
  //     .pipe(catchError(this.handleError));
  // }

  update(id: number, inventoryItem: InventoryItem, itemCategoryId: number): Observable<InventoryItem> {
    const headers = this.getAuthHeaders();
    const url = `${this.apiUrl}/update/${id}?itemCategoryId=${itemCategoryId}`;
    return this.http.put<InventoryItem>(url, inventoryItem).pipe(catchError(this.handleError));
  }

  // Delete item
  deleteInventoryItem(id: number): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http
      .delete<void>(`${this.apiUrl}/${id}`, { headers })
      .pipe(catchError(this.handleError));  // Add error handling here
  }

   // Helper method to handle errors and show snackbar
   private handleError(message: string, error: any): Observable<never> {
    this.snackBar.open(message, 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
    console.error(error); // Log the error for debugging
    throw error;
  }
}

