import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';
import { InventoryItem } from '../model/inventory-item';

@Injectable({
  providedIn: 'root'
})
export class InventoryItemService {

  // private apiUrl = `${environment.apiBaseUrl}/api/v2/inventoryitem`;  // Ensure correct base URL

  private apiUrl = `http://localhost:8080/api/v2/inventoryitem`;  // Ensure correct base URL

  constructor(private http: HttpClient) {}

  // Helper method for authorization headers
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');  // Or use your auth service to get the token
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // Create
  // createInventoryItem(inventoryItem: InventoryItem): Observable<InventoryItem> {
  //   const headers = this.getAuthHeaders();
  //   return this.http
  //     .post<InventoryItem>(`${this.apiUrl}/create`, inventoryItem, { headers })
  //     .pipe(catchError(this.handleError));  // Add error handling here
  // }

  createInventoryItem(inventoryItem: InventoryItem): Observable<InventoryItem> {
    const headers = this.getAuthHeaders();
    return this.http
      .post<InventoryItem>(`${this.apiUrl}/create?itemCategoryId=${inventoryItem.itemCategoryId}`, inventoryItem, { headers })
      .pipe(catchError(this.handleError));
}

  // Read all items with pagination
  getAllInventoryItems(page: number, size: number): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http
      .get<any>(`${this.apiUrl}/list`, { params })
      .pipe(catchError(this.handleError));  // Add error handling here
  }

  // Get single item by ID
  getInventoryItemById(id: number): Observable<InventoryItem> {
    return this.http
      .get<InventoryItem>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));  // Add error handling here
  }

  // Update item
  // updateInventoryItem(id: number, inventoryItem: InventoryItem): Observable<InventoryItem> {
  //   const headers = this.getAuthHeaders();
  //   return this.http
  //     .put<InventoryItem>(`${this.apiUrl}/update/${id}`, inventoryItem, { headers })
  //     .pipe(catchError(this.handleError));  // Add error handling here
  // }

  // Updated update method to include itemCategoryId in the URL
updateInventoryItem(id: number, inventoryItem: InventoryItem): Observable<InventoryItem> {
  const headers = this.getAuthHeaders();
  return this.http
    .put<InventoryItem>(`${this.apiUrl}/update/${id}?itemCategoryId=${inventoryItem.itemCategoryId}`, inventoryItem, { headers })
    .pipe(catchError(this.handleError));
}

  // Delete item
  deleteInventoryItem(id: number): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http
      .delete<void>(`${this.apiUrl}/${id}`, { headers })
      .pipe(catchError(this.handleError));  // Add error handling here
  }

  // Handle HTTP errors globally
  private handleError(error: any): Observable<never> {
    // Log the error to the console or show it in a global error handling service
    console.error('Error occurred: ', error);
    throw error;  // Rethrow the error to be handled by the component
  }
}

