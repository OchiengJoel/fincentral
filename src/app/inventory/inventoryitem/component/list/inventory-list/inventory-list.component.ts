import { Component, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { InventoryItem, PaginatedResponse } from 'src/app/inventory/inventoryitem/model/inventory-item';
import { InventoryItemService } from 'src/app/inventory/inventoryitem/service/inventory-item.service';
import { InventoryFormComponent } from '../../addedit/inventory-form/inventory-form.component';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs/internal/Subscription';
import { AuthService } from 'src/app/auth/service/auth.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-inventory-list',
  templateUrl: './inventory-list.component.html',
  styleUrls: ['./inventory-list.component.css']
})
export class InventoryListComponent {

  inventoryItems: InventoryItem[] = [];
  displayedColumns: string[] = ['select', 'id', 'name', 'quantity', 'price', 'totalPrice', 'actions'];
  page = 0;
  size = 10;
  totalItems = 0;
  private companySwitchSubscription!: Subscription;
  selection: Set<InventoryItem> = new Set<InventoryItem>();
  dataSource: MatTableDataSource<InventoryItem> = new MatTableDataSource<InventoryItem>(this.inventoryItems);

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;


  constructor(
    private inventoryItemService: InventoryItemService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadInventoryItems();
    this.companySwitchSubscription = this.authService.companySwitched$.subscribe(companyId => {
      if (companyId !== null) {
        console.log('Company switched in InventoryListComponent, reloading data for company:', companyId);
        this.loadInventoryItems();
      }
    });
  }

  ngOnDestroy(): void {
    this.companySwitchSubscription?.unsubscribe();
  }

  loadInventoryItems(): void {
    this.inventoryItemService.getAllInventoryItems(this.page, this.size).subscribe(
      (response: PaginatedResponse<InventoryItem>) => {
        this.inventoryItems = response.items;
        this.totalItems = response.totalItems;
        console.log('Inventory items loaded:', this.inventoryItems);
      },
      (error) => {
        this.snackBar.open('Failed to load inventory items', 'Close', { duration: 5000 });
      }
    );
  }

  openFormDialog(id?: number): void {
    const dialogRef = this.dialog.open(InventoryFormComponent, {
      width: '600px',
      data: { itemId: id }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadInventoryItems();
      }
    });
  }

  editItem(id: number): void {
    this.router.navigate(['/edit-inventory', id]);
  }

  deleteItem(id: number): void {
    this.inventoryItemService.deleteInventoryItem(id).subscribe(
      () => {
        this.snackBar.open('Item deleted successfully!', 'Close', { duration: 5000 });
        this.loadInventoryItems();
      },
      () => {
        this.snackBar.open('Failed to delete item', 'Close', { duration: 5000 });
      }
    );
  }

  applyFilter(event: KeyboardEvent): void {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.inventoryItems = this.inventoryItems.filter(item =>
      item.name.toLowerCase().includes(filterValue) ||
      item.description.toLowerCase().includes(filterValue)
    );
  }

  toggleAll(event: any): void {
      if (event.checked) {
        this.dataSource.data.forEach(inventoryitem => this.selection.add(inventoryitem));
      } else {
        this.selection.clear();
      }
    }
  
    toggleSelection(inventoryitem: InventoryItem): void {
      if (this.selection.has(inventoryitem)) {
        this.selection.delete(inventoryitem);
      } else {
        this.selection.add(inventoryitem);
      }
    }

  isAllSelected(): boolean {
    return this.selection.size === this.dataSource.data.length;
  }

  isSomeSelected(): boolean {
    return this.selection.size > 0 && this.selection.size < this.dataSource.data.length;
  }

  hasSelectedInventoryItems(): boolean {
    return this.selection.size > 0;
  }

  deleteSelectedInventoryItem(): void {
    // Implement if needed
  }
}
