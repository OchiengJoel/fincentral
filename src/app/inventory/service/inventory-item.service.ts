import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { InventoryItem } from '../model/inventory-item';

@Injectable({
  providedIn: 'root'
})
export class InventoryItemService {

  // private apiUrl = `${environment.apiBaseUrl}/api/v2/inventoryitem`;  // Ensure correct base URL

  private apiUrl = `http://localhost:8080/api/v2/inventoryitem`;  // Ensure correct base URL
  constructor(private http: HttpClient) {}

  // Create
  createInventoryItem(inventoryItem: InventoryItem): Observable<InventoryItem> {
    const token = localStorage.getItem('token'); // Or use your auth service to get the token
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<InventoryItem>(`${this.apiUrl}/create`, inventoryItem, { headers });
  }

  // Read all items
  getAllInventoryItems(page: number, size: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/list?page=${page}&size=${size}`);
  }

  // Get single item by ID
  getInventoryItemById(id: number): Observable<InventoryItem> {
    return this.http.get<InventoryItem>(`${this.apiUrl}/${id}`);
  }

  // Update item
  updateInventoryItem(id: number, inventoryItem: InventoryItem): Observable<InventoryItem> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put<InventoryItem>(`${this.apiUrl}/update/${id}`, inventoryItem, { headers });
  }

  // Delete item
  deleteInventoryItem(id: number): Observable<void> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers });
  }
}
