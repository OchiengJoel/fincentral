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
  itemCategories: Itemcategory[] = [];
  isEditMode: boolean = false;
  inventoryItemId!: number;
  //inventoryId: string | null = null;
  //categories: Itemcategory[] = [];  // Holds all categories

  constructor(
    private fb: FormBuilder,
    private inventoryItemService: InventoryItemService,
    private itemCategoryService: ItemcategoryService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<InventoryFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    // this.inventoryItemForm = this.fb.group({
    //   name: ['', [Validators.required, Validators.maxLength(255)]],
    //   description: ['', Validators.maxLength(500)],
    //   quantity: [0, [Validators.required, Validators.min(1)]],
    //   price: [0, [Validators.required, Validators.min(0)]],
    //   totalPrice: [{ value: 0, disabled: true }],
    //   itemCategoryId: ['', Validators.required]
    // });

    // // Recalculate total price if quantity or price changes
    // this.inventoryItemForm.valueChanges.subscribe(() => {
    //   this.updateTotalPrice();
    // });
  }

  ngOnInit(): void {
    // Initialize form group with the required fields
    this.inventoryItemForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      quantity: [0, [Validators.required, Validators.min(0)]],
      price: [0, [Validators.required, Validators.min(0)]],
      itemCategoryId: ['', Validators.required]
    });

    // Load item categories for the dropdown
    this.loadItemCategories();

    // Check if we're in edit mode
    this.route.params.subscribe(params => {
      this.inventoryItemId = params['id'];
      if (this.inventoryItemId) {
        this.isEditMode = true;
        this.loadInventoryItem(this.inventoryItemId);
      }
    });
  }

  // Load item categories from the ItemCategoryService
  loadItemCategories(): void {
    this.itemCategoryService.getAllCategories().subscribe(
      categories => this.itemCategories = categories,
      error => this.showError('Failed to load item categories.')
    );
  }

  // Load the inventory item for editing
  loadInventoryItem(id: number): void {
    this.inventoryItemService.getInventoryItemById(id).subscribe(
      (item: InventoryItem) => {
        this.inventoryItemForm.patchValue(item); // Populate form fields with the existing item data
      },
      error => this.showError('Failed to load inventory item.')
    );
  }

  // Handle form submission
  onSubmit(): void {
    if (this.inventoryItemForm.invalid) {
      return;
    }

    const inventoryItem: InventoryItem = this.inventoryItemForm.value;
    const itemCategoryId = this.inventoryItemForm?.get('itemCategoryId')?.value; // Extract itemCategoryId from form

    if (this.isEditMode) {
      this.updateInventoryItem(inventoryItem, itemCategoryId);
    } else {
      this.createInventoryItem(inventoryItem, itemCategoryId);
    }
  }

  // Create a new inventory item
  createInventoryItem(item: InventoryItem, itemCategoryId: number): void {
    this.inventoryItemService.createInventoryItem(item, itemCategoryId).subscribe(
      () => {
        this.showSuccess('Inventory item added successfully');
        this.router.navigate(['/inventory']); // Navigate to inventory list after successful creation
      },
      error => this.showError('Failed to add inventory item.')
    );
  }

  // Update an existing inventory item
  updateInventoryItem(item: InventoryItem, itemCategoryId: number): void {
    this.inventoryItemService.update(this.inventoryItemId, item, itemCategoryId).subscribe(
      () => {
        this.showSuccess('Inventory item updated successfully');
        this.router.navigate(['/inventory']); // Navigate to inventory list after successful update
      },
      error => this.showError('Failed to update inventory item.')
    );
  }

  // Update total price based on quantity and price
  private updateTotalPrice(): void {
    const quantity = this.inventoryItemForm.get('quantity')?.value;
    const price = this.inventoryItemForm.get('price')?.value;
    const totalPrice = quantity * price;
    this.inventoryItemForm.patchValue({ totalPrice });
  }

  // Show error message with MatSnackBar
  showError(message: string): void {
    this.snackBar.open(message, 'Close', { duration: 3000, panelClass: ['error-snackbar'] });
  }

  // Show success message with MatSnackBar
  showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', { duration: 3000, panelClass: ['success-snackbar'] });
  }

  // Cancel the operation and navigate back to the inventory list
  onCancel(): void {
    this.router.navigate(['/dashboard/inventory-item']);
  }

  // ngOnInit(): void {
  //   // Get item categories for dropdown
  //   this.categoryService.getAllCategories().subscribe(
  //     (categories: Itemcategory[]) => {  // Directly accept an array of Itemcategory
  //       console.log('Received categories:', categories);  // Log to check the data
  //       this.categories = categories || [];  // Assign the array to categories
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
  

  // Update total price based on quantity and price
  // private updateTotalPrice(): void {
  //   const quantity = this.inventoryItemForm.get('quantity')?.value;
  //   const price = this.inventoryItemForm.get('price')?.value;
  //   const totalPrice = quantity * price;
  //   this.inventoryItemForm.patchValue({ totalPrice });
  // }

  // Load inventory item details to edit
  loadInventoryItemDetails(id: number): void {
    this.inventoryItemService.getInventoryItemById(id).subscribe(
      (inventory) => {
        this.isEditMode = true;
        this.inventoryItemForm.patchValue(inventory);  // Load inventory item details into the form
      },
      (error) => {
        this.snackBar.open('Failed to load inventory item details', 'Close', { duration: 5000 });
      }
    );
  }


  // Save the form data (create or update)
  // saveInventoryItem(): void {
  //   if (this.inventoryItemForm.invalid) {
  //     this.snackBar.open('Please fill out all required fields correctly.', 'Close', { duration: 5000 });
  //     return;
  //   }

  //   const inventoryItem: InventoryItem = this.inventoryItemForm.value;
  //   if (inventoryItem.id) {
  //     // If the item has an id, update it
  //     this.inventoryItemService.updateInventoryItem(inventoryItem.id, inventoryItem).subscribe(
  //       () => {
  //         this.dialogRef.close(true);
  //         this.snackBar.open('Inventory item updated successfully!', 'Close', { duration: 5000 });
  //       },
  //       (error) => this.snackBar.open('Failed to update item', 'Close', { duration: 5000 })
  //     );
  //   } else {
  //     // If there's no id, create a new item
  //     this.inventoryItemService.createInventoryItem(inventoryItem).subscribe(
  //       () => {
  //         this.dialogRef.close(true);
  //         this.snackBar.open('Inventory item created successfully!', 'Close', { duration: 5000 });
  //       },
  //       (error) => this.snackBar.open('Failed to create item', 'Close', { duration: 5000 })
  //     );
  //   }
  // }

  // Cancel the form and close the dialog
  onCancel1(): void {
    this.router.navigate(['/dashboard/inventory-item']);
    this.dialogRef.close(false);  // Close the dialog without saving
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