import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { CountryService } from '../../../service/country.service';
import { CountryformComponent } from '../../form/countryform/countryform.component';

@Component({
  selector: 'app-countrylist',
  templateUrl: './countrylist.component.html',
  styleUrls: ['./countrylist.component.css']
})
export class CountrylistComponent implements OnInit{

  displayedColumns: string[] = ['id', 'name', 'code', 'continent', 'actions'];
  dataSource = new MatTableDataSource<any>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private countryService: CountryService, private dialog: MatDialog, private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.loadCountries();
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  loadCountries(): void {
    this.countryService.getCountries().subscribe((response) => {
      this.dataSource.data = response.content;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(CountryformComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadCountries();
      }
    });
  }

  openEditDialog(country: any): void {
    const dialogRef = this.dialog.open(CountryformComponent, {
      width: '400px',
      data: country
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadCountries();
      }
    });
  }

  deleteCountry(id: number): void {
    if (confirm('Are you sure you want to delete this country?')) {
      this.countryService.deleteCountry(id).subscribe(() => {
        this.snackBar.open('Country deleted successfully', 'Close', { duration: 5000 });
        this.loadCountries();
      });
    }
  }
}


