import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { InventoryItem } from 'src/app/inventory/inventoryitem/model/inventory-item';
import { InventoryItemService } from 'src/app/inventory/inventoryitem/service/inventory-item.service';
import { Itemcategory } from 'src/app/inventory/itemcategory/model/itemcategory';
import { ItemcategoryService } from 'src/app/inventory/itemcategory/service/itemcategory.service';

@Component({
  selector: 'app-inventory-form',
  templateUrl: './inventory-form.component.html',
  styleUrls: ['./inventory-form.component.css']
})
export class InventoryFormComponent {

  inventoryItemForm!: FormGroup;  // Reactive form group for inventory item
  categories: Itemcategory[] = [];  // Holds all categories
  inventoryId: string | null = null;
  isEditMode: boolean = false;

  constructor(
    private fb: FormBuilder,
    private inventoryItemService: InventoryItemService,
    private categoryService: ItemcategoryService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<InventoryFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {

    this.inventoryItemForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(255)]],
      description: ['', Validators.maxLength(500)],
      quantity: [0, [Validators.required, Validators.min(1)]],
      price: [0, [Validators.required, Validators.min(0)]],
      totalPrice: [{ value: 0, disabled: true }],
      itemCategoryId: ['', Validators.required]
    });

    // Recalculate total price if quantity or price changes
    this.inventoryItemForm.valueChanges.subscribe(() => {
      this.updateTotalPrice();
    });
  }

   // Update total price based on quantity and price
   private updateTotalPrice(): void {
    const quantity = this.inventoryItemForm.get('quantity')?.value;
    const price = this.inventoryItemForm.get('price')?.value;
    const totalPrice = quantity * price;
    this.inventoryItemForm.patchValue({ totalPrice });
  }

  // ngOnInit(): void {
  //   // Get item categoris for dropdown
  //   this.categoryService.getAllCategories().subscribe(
  //     (data: Itemcategory[]) => {
  //       this.categories = data; // Assuming data.content is the array of countries
  //     },
  //     (error) => {
  //       this.snackBar.open('Failed to load item categories', 'Close', { duration: 5000 });
  //     }
  //   );

  //   // Check if we're editing an existing inventory item
  //   this.route.paramMap.subscribe(params => {
  //     this.inventoryId = params.get('id');
  //     if (this.inventoryId) {
  //       this.loadInventoryItemDetails(Number(this.inventoryId)); // Convert companyId to number
  //     }
  //   });
  // }

  ngOnInit(): void {
    // Get item categories for dropdown
    this.categoryService.getAllCategories().subscribe(
      (data: Itemcategory[]) => {
        this.categories = data;  // Assuming data is an array of categories
      },
      (error) => {
        this.snackBar.open('Failed to load item categories', 'Close', { duration: 5000 });
      }
    );
  
    // Check if we're editing an existing inventory item
    this.route.paramMap.subscribe(params => {
      this.inventoryId = params.get('id');
      if (this.inventoryId) {
        this.loadInventoryItemDetails(Number(this.inventoryId)); // Convert companyId to number
      }
    });
  }
  

  loadInventoryItemDetails(id: number): void {
    this.inventoryItemService.getInventoryItemById(id).subscribe(
      (inventory) => {
        this.inventoryItemForm.patchValue(inventory);  // Load company details into the form
      },
      (error) => {
        this.snackBar.open('Failed to load inventory item details', 'Close', { duration: 5000 });
      }
    );
  }

  // Save the form data
  saveInventoryItem(): void {
    if (this.inventoryItemForm.invalid) {
      this.snackBar.open('Please fill out all required fields correctly.', 'Close', { duration: 5000 });
      return;
    }

    const inventoryItem: InventoryItem = this.inventoryItemForm.value;
    if (inventoryItem.id) {
      // If the item has an id, update it
      this.inventoryItemService.updateInventoryItem(inventoryItem.id, inventoryItem).subscribe(
        () => {
          this.dialogRef.close(true);
          this.snackBar.open('Inventory item updated successfully!', 'Close', { duration: 5000 });
        },
        (error) => this.snackBar.open('Failed to update item', 'Close', { duration: 5000 })
      );
    } else {
      // If there's no id, create a new item
      this.inventoryItemService.createInventoryItem(inventoryItem).subscribe(
        () => {
          this.dialogRef.close(true);
          this.snackBar.open('Inventory item created successfully!', 'Close', { duration: 5000 });
        },
        (error) => this.snackBar.open('Failed to create item', 'Close', { duration: 5000 })
      );    }
  }

  // Cancel the form and close the dialog
  onCancel(): void {
    this.router.navigate(['/dashboard/inventory-item']);
  }

}


// save(): void {
//   if (this.inventoryItem.id) {
//     // If the item has an id, update it (edit)
//     this.inventoryItemService.updateInventoryItem(this.inventoryItem.id, this.inventoryItem).subscribe(
//       () => {
//         this.dialogRef.close(true); // Close dialog and return success
//         this.snackBar.open('Inventory item updated successfully!', 'Close', { duration: 5000 });
//       },
//       (error) => {
//         this.snackBar.open('Failed to update item', 'Close', { duration: 5000 });
//       }
//     );
//   } else {
//     // If there's no id, create a new item
//     this.inventoryItemService.createInventoryItem(this.inventoryItem).subscribe(
//       () => {
//         this.dialogRef.close(true); // Close dialog and return success
//         this.snackBar.open('Inventory item created successfully!', 'Close', { duration: 5000 });
//       },
//       (error) => {
//         this.snackBar.open('Failed to create item', 'Close', { duration: 5000 });
//       }
//     );
//   }
// }

// cancel(): void {
//   this.dialogRef.close(false); // Close dialog without saving
// }


// ngOnInit(): void {
  //   if (this.data.itemId) {
  //     // If itemId is provided, load the inventory item for editing
  //     this.inventoryItemService.getInventoryItemById(this.data.itemId).subscribe(
  //       (item) => {
  //         this.inventoryItem = item;
  //       },
  //       (error) => {
  //         this.snackBar.open('Failed to load inventory item', 'Close', { duration: 5000 });
  //       }
  //     );
  //   }
  // }

  // ngOnInit(): void {
  //   this.initForm();  // Initialize the form

  //   // Fetch categories
  //   this.categoryService.getAllCategories().subscribe(
  //     categories => this.categories = categories,
  //     error => this.snackBar.open('Failed to load categories', 'Close', { duration: 5000 })
  //   );

  //   // If editing, load the existing inventory item
  //   if (this.data.itemId) {
  //     this.inventoryItemService.getInventoryItemById(this.data.itemId).subscribe(
  //       (item: InventoryItem) => this.populateForm(item),
  //       (error) => this.snackBar.open('Failed to load inventory item', 'Close', { duration: 5000 })
  //     );
  //   }
  // }

  // // Initialize the form with FormBuilder
  // private initForm(): void {
  //   this.inventoryItemForm = this.formBuilder.group({
  //     name: ['', [Validators.required, Validators.maxLength(255)]],
  //     description: ['', Validators.maxLength(500)],
  //     quantity: [0, [Validators.required, Validators.min(1)]],
  //     price: [0, [Validators.required, Validators.min(0)]],
  //     totalPrice: [{ value: 0, disabled: true }],
  //     itemCategoryId: ['', Validators.required]
  //   });

  //   // Recalculate total price if quantity or price changes
  //   this.inventoryItemForm.valueChanges.subscribe(() => {
  //     this.updateTotalPrice();
  //   });
  // }


  // Populate form with data if editing
  // private populateForm(item: InventoryItem): void {
  //   this.inventoryItemForm.patchValue({
  //     name: item.name,
  //     description: item.description,
  //     quantity: item.quantity,
  //     price: item.price,
  //     totalPrice: item.totalPrice,
  //     itemCategoryId: item.itemCategory?.id  // Populate the itemCategoryId field from itemCategory object
  //   });
  // }

  // saveCompany(): void {
  //     if (this.inventoryItemForm.invalid) {
  //       this.snackBar.open('Please fill in all required fields.', 'Close', { duration: 5000 });
  //       return;
  //     }

  //     // Create a company object that includes the ID (for updates)
  //     const inventoryItemToSave: InventoryItem = { ...this.inventoryItemForm.value, id: this.inventoryId ? Number(this.inventoryId) : null };

  //     if (this.inventoryId) {
  //       // If companyId exists, it's an update
  //       this.inventoryItemService.updateInventoryItem(inventoryItemToSave).subscribe(
  //         (response) => {
  //           this.snackBar.open('Company updated successfully!', 'Close', { duration: 5000 });
  //           this.router.navigate(['/dashboard/companies']);
  //         },
  //         (error) => {
  //           this.snackBar.open('Failed to update company.', 'Close', { duration: 5000 });
  //         }
  //       );
  //     } else {
  //       // If no companyId, it's a create
  //       this.companyService.createCompany(this.companyForm.value).subscribe(
  //         (response) => {
  //           this.snackBar.open('Company created successfully!', 'Close', { duration: 5000 });
  //           this.router.navigate(['/dashboard/companies']);
  //         },
  //         (error) => {
  //           this.snackBar.open('Failed to create company.', 'Close', { duration: 5000 });
  //         }
  //       );
  //     }
  //   }

  //   onCancel(): void {
  //     this.router.navigate(['/dashboard/companies']);
  //   }
