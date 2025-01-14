import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Itemcategory } from '../../../model/itemcategory';
import { ItemcategoryService } from '../../../service/itemcategory.service';
import { ItemcategoryformComponent } from '../../addedit/itemcategoryform/itemcategoryform.component';

@Component({
  selector: 'app-itemcategorylist',
  templateUrl: './itemcategorylist.component.html',
  styleUrls: ['./itemcategorylist.component.css']
})
export class ItemcategorylistComponent {

  displayedColumns: string[] = ['id', 'name', 'description', 'itemType', 'actions'];
  dataSource: MatTableDataSource<Itemcategory> = new MatTableDataSource<Itemcategory>();
  pageIndex: number = 0;
  pageSize: number = 10;

  constructor(private itemCategoryService: ItemcategoryService, public dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadItemCategories();
  }

  loadItemCategories(): void {
    this.itemCategoryService.getItemCategories(this.pageIndex, this.pageSize).subscribe(data => {
      this.dataSource.data = data.items;
    });
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(ItemcategoryformComponent, {
      width: '400px',
      data: { isNew: true }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadItemCategories(); // Reload the table
      }
    });
  }

  openEditDialog(id: number): void {
    this.itemCategoryService.getItemCategory(id).subscribe(itemCategory => {
      const dialogRef = this.dialog.open(ItemcategoryformComponent, {
        width: '400px',
        data: { isNew: false, itemCategory: itemCategory }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.loadItemCategories(); // Reload the table
        }
      });
    });
  }

  deleteItemCategory(id: number): void {
    if (confirm('Are you sure you want to delete this ItemCategory?')) {
      this.itemCategoryService.deleteItemCategory(id).subscribe(() => {
        this.loadItemCategories(); // Reload the table
      });
    }
  }
}


