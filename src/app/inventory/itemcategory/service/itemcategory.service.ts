import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { InventoryItem } from '../../inventoryitem/model/inventory-item';
import { Itemcategory } from '../model/itemcategory';

@Injectable({
  providedIn: 'root'
})
export class ItemcategoryService {

  private apiUrl = 'http://localhost:8080/api/v2/item-categories';

  constructor(
    private http: HttpClient
  ) { }

   // Helper method for authorization headers
    private getAuthHeaders(): HttpHeaders {
      const token = localStorage.getItem('token');  // Or use your auth service to get the token
      return new HttpHeaders().set('Authorization', `Bearer ${token}`);
    }
  
    // Create
    createItemCategory(itemCategory: Itemcategory): Observable<Itemcategory> {
      const headers = this.getAuthHeaders();
      return this.http
        .post<Itemcategory>(`${this.apiUrl}/create`, itemCategory, { headers })
        .pipe(catchError(this.handleError));  // Add error handling here
    }
  
    // Read all items with pagination
    getItemCategories(page: number, size: number): Observable<any> {
      const headers = this.getAuthHeaders();
      const params = new HttpParams()
        .set('page', page.toString())
        .set('size', size.toString());
  
      return this.http
        .get<any>(`${this.apiUrl}/list`, { params })
        .pipe(catchError(this.handleError));  // Add error handling here
    }

    getAllCategories(): Observable<Itemcategory[]> {
      const headers = this.getAuthHeaders();
      return this.http.get<Itemcategory[]>(`${this.apiUrl}/list`);
    }
  
    // Get single item by ID
    getItemCategory(id: number): Observable<Itemcategory> {
      return this.http
        .get<Itemcategory>(`${this.apiUrl}/${id}`)
        .pipe(catchError(this.handleError));  // Add error handling here
    }
  
    // Update item
    updateItemCategory(id: number, itemCategory: Itemcategory): Observable<Itemcategory> {
      const headers = this.getAuthHeaders();
      return this.http
        .put<Itemcategory>(`${this.apiUrl}/update/${id}`, itemCategory, { headers })
        .pipe(catchError(this.handleError));  // Add error handling here
    }
  
    // Delete item
    deleteItemCategory(id: number): Observable<void> {
      const headers = this.getAuthHeaders();
      return this.http
        .delete<void>(`${this.apiUrl}/delete/${id}`, { headers })
        .pipe(catchError(this.handleError));  // Add error handling here
    }
  
    // Handle HTTP errors globally
    private handleError(error: any): Observable<never> {
      // Log the error to the console or show it in a global error handling service
      console.error('Error occurred: ', error);
      throw error;  // Rethrow the error to be handled by the component
    }
}
