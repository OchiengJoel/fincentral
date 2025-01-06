import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InventoryItem } from 'src/app/inventory/model/inventory-item';
import { InventoryItemService } from 'src/app/inventory/service/inventory-item.service';

@Component({
  selector: 'app-inventory-form',
  templateUrl: './inventory-form.component.html',
  styleUrls: ['./inventory-form.component.css']
})
export class InventoryFormComponent {

  inventoryItem: InventoryItem = { id: 0, name: '', description: '', quantity: 0, price: 0, totalPrice: 0 };

  constructor(
    public dialogRef: MatDialogRef<InventoryFormComponent>,
    private inventoryItemService: InventoryItemService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    if (this.data.itemId) {
      // If itemId is provided, load the inventory item for editing
      this.inventoryItemService.getInventoryItemById(this.data.itemId).subscribe(
        (item) => {
          this.inventoryItem = item;
        },
        (error) => {
          this.snackBar.open('Failed to load inventory item', 'Close', { duration: 5000 });
        }
      );
    }
  }

  save(): void {
    if (this.inventoryItem.id) {
      // If the item has an id, update it (edit)
      this.inventoryItemService.updateInventoryItem(this.inventoryItem.id, this.inventoryItem).subscribe(
        () => {
          this.dialogRef.close(true); // Close dialog and return success
          this.snackBar.open('Inventory item updated successfully!', 'Close', { duration: 5000 });
        },
        (error) => {
          this.snackBar.open('Failed to update item', 'Close', { duration: 5000 });
        }
      );
    } else {
      // If there's no id, create a new item
      this.inventoryItemService.createInventoryItem(this.inventoryItem).subscribe(
        () => {
          this.dialogRef.close(true); // Close dialog and return success
          this.snackBar.open('Inventory item created successfully!', 'Close', { duration: 5000 });
        },
        (error) => {
          this.snackBar.open('Failed to create item', 'Close', { duration: 5000 });
        }
      );
    }
  }

  cancel(): void {
    this.dialogRef.close(false); // Close dialog without saving
  }

}
