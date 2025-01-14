import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Company } from 'src/app/company/model/company';
import { CompanyService } from 'src/app/company/service/company.service';
import { CompanyaddeditComponent } from '../../addedit/companyaddedit/companyaddedit.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-companylist',
  templateUrl: './companylist.component.html',
  styleUrls: ['./companylist.component.css']
})
export class CompanylistComponent implements OnInit {

  displayedColumns: string[] = ['id', 'name', 'actions'];
  dataSource: MatTableDataSource<Company> = new MatTableDataSource<Company>([]);
  pageSize = 10;

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private companyService: CompanyService, 
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCompanies();
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openFormDialog(company?: Company): void {
    if (company) {
      this.router.navigate(['/dashboard/companies/edit', company.id]); // Edit existing company
    } else {
      this.router.navigate(['/dashboard/companies/add']); // Add new company
    }
  }

  loadCompanies(): void {
    this.companyService.getCompanies().subscribe(
      (response) => {
        // Assuming the response structure is as provided (with 'content' field containing the company list)
        this.dataSource.data = response.content; // Assign only the 'content' array to the dataSource
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      (error) => {
        this.snackBar.open('Failed to load companies', 'Close', { duration: 5000 });
      }
    );
  }
  

  deleteCompany(id: number): void {
    this.companyService.deleteCompany(id).subscribe(
      () => {
        this.snackBar.open('Company deleted successfully', 'Close', { duration: 5000 });
        this.loadCompanies(); // Reload the list after deletion
      },
      () => {
        this.snackBar.open('Failed to delete company', 'Close', { duration: 5000 });
      }
    );
  }
}


// openFormDialog(company?: Company): void {
  //   const dialogRef = this.dialog.open(CompanyaddeditComponent, {
  //     width: '600px',
  //     data: company
  //   });

  //   dialogRef.afterClosed().subscribe(result => {
  //     if (result) {
  //       this.loadCompanies;
  //     }
  //   });
  // }


   // loadCompanies(page: number, size: number): void {
  //   this.companyService.getCompanies(page, size).subscribe(
  //     (data) => {
  //       this.dataSource = new MatTableDataSource(data.content);  // Assign to dataSource here
  //     },
  //     (error) => {
  //       this.snackBar.open('Failed to load companies', 'Close', { duration: 5000 });
  //     }
  //   );
  // }

