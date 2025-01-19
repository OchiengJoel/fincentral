import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { InventoryItem } from 'src/app/inventory/inventoryitem/model/inventory-item';
import { InventoryItemService } from 'src/app/inventory/inventoryitem/service/inventory-item.service';
import { InventoryFormComponent } from '../../addedit/inventory-form/inventory-form.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-inventory-list',
  templateUrl: './inventory-list.component.html',
  styleUrls: ['./inventory-list.component.css']
})
export class InventoryListComponent {

  inventoryItems: InventoryItem[] = [];
  displayedColumns: string[] = ['id', 'name', 'quantity', 'price', 'totalPrice', 'actions'];
  page = 0;
  size = 10;

  constructor(
    private inventoryItemService: InventoryItemService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog // Injecting MatDialog for the dialog
  ) {}

  ngOnInit(): void {
    this.loadInventoryItems();
  }

  loadInventoryItems(): void {
    this.inventoryItemService.getAllInventoryItems(this.page, this.size).subscribe(
      (response) => {
        this.inventoryItems = response;
      },
      (error) => {
        this.snackBar.open('Failed to load inventory items', 'Close', { duration: 5000 });
      }
    );
  }

  openFormDialog(id?: number): void {
    // Open the dialog for adding or editing an inventory item
    const dialogRef = this.dialog.open(InventoryFormComponent, {
      width: '600px',
      data: { itemId: id } // Pass the ID if editing, otherwise it's for adding a new item
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Reload inventory items after the form is closed and changes are made
        this.loadInventoryItems();
      }
    });
  }

  editItem(id: number): void {
    this.router.navigate(['/edit-inventory', id]);  // Ensure you have this route set up
  }

  deleteItem(id: number): void {
    this.inventoryItemService.deleteInventoryItem(id).subscribe(
      () => {
        this.snackBar.open('Item deleted successfully!', 'Close', { duration: 5000 });
        this.loadInventoryItems();  // Refresh the list
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

}
