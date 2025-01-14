import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Itemcategory } from '../../../model/itemcategory';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ItemcategoryService } from '../../../service/itemcategory.service';

@Component({
  selector: 'app-itemcategoryform',
  templateUrl: './itemcategoryform.component.html',
  styleUrls: ['./itemcategoryform.component.css']
})
export class ItemcategoryformComponent {

  itemCategoryForm: FormGroup;
  isNew: boolean;
  itemCategory: Itemcategory;

  constructor(
    private fb: FormBuilder,
    private itemCategoryService: ItemcategoryService,
    public dialogRef: MatDialogRef<ItemcategoryformComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.isNew = data.isNew;
    this.itemCategory = data.itemCategory || { id: 0, name: '', description: '', itemType: 'GOODS' };
    
    this.itemCategoryForm = this.fb.group({
      name: [this.itemCategory.name, Validators.required],
      description: [this.itemCategory.description],
      itemType: [this.itemCategory.itemType, Validators.required],
    });
  }

  onSave(): void {
    if (this.itemCategoryForm.valid) {
      if (this.isNew) {
        this.itemCategoryService.createItemCategory(this.itemCategoryForm.value).subscribe(() => {
          this.dialogRef.close(true);
        });
      } else {
        this.itemCategoryService.updateItemCategory(this.itemCategory.id, this.itemCategoryForm.value).subscribe(() => {
          this.dialogRef.close(true);
        });
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}

