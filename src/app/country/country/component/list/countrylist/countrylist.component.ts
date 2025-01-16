import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { CountryService } from '../../../service/country.service';
import { CountryformComponent } from '../../form/countryform/countryform.component';
import { Country } from '../../../model/country';
import { Router } from '@angular/router';

@Component({
  selector: 'app-countrylist',
  templateUrl: './countrylist.component.html',
  styleUrls: ['./countrylist.component.css']
})
export class CountrylistComponent implements OnInit{

  displayedColumns: string[] = ['id', 'name', 'code', 'continent', 'actions'];
  //dataSource = new MatTableDataSource<any>();
  dataSource: MatTableDataSource<Country> = new MatTableDataSource<Country>([]);
    pageSize = 10;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private countryService: CountryService, 
    private dialog: MatDialog, 
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

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

  openFormDialog(country?: Country): void {
      if (country) {
        this.router.navigate(['/dashboard/countries/edit', country.id]); // Edit existing company
      } else {
        this.router.navigate(['/dashboard/countries/add']); // Add new company
      }
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


