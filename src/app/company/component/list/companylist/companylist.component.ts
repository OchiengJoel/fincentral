import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Company, CompanyPage } from 'src/app/company/model/company';
import { CompanyService } from 'src/app/company/service/company.service';
import { CompanyaddeditComponent } from '../../addedit/companyaddedit/companyaddedit.component';
import { Router } from '@angular/router';
import { CountryService } from 'src/app/country/country/service/country.service';
import { Country } from 'src/app/country/country/model/country';

@Component({
  selector: 'app-companylist',
  templateUrl: './companylist.component.html',
  styleUrls: ['./companylist.component.css']
})
export class CompanylistComponent implements OnInit {

  displayedColumns: string[] = [
    'select', 'name', 'primaryEmail', 'primaryContact', 'country', 'town',
    'secondaryEmail', 'secondaryContact', 'address', 'registration', 'tax_id', 'status', 'actions'
  ];
  dataSource: MatTableDataSource<Company> = new MatTableDataSource<Company>([]);
  pageSize = 10;
  countries: Country[] = [];
  selection: Set<Company> = new Set<Company>();

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private companyService: CompanyService,
    private countryService: CountryService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.countryService.getCountries().subscribe({
      next: (countries: Country[]) => {
        this.countries = countries;
      },
      error: () => {
        this.snackBar.open('Failed to load countries', 'Close', { duration: 5000 });
      }
    });
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
      this.router.navigate(['/dashboard/companies/edit', company.id]);
    } else {
      this.router.navigate(['/dashboard/companies/add']);
    }
  }

  getCountryName(countryId: number): string {
    const country = this.countries.find(c => c.id === countryId);
    return country ? country.name : 'N/A';
  }

  loadCompanies(): void {
    this.companyService.getCompanies().subscribe({
      next: (response: CompanyPage) => {
        this.dataSource.data = response.content.map(company => ({
          ...company,
          countryName: this.getCountryName(company.countryId)
        }));
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      error: () => {
        this.snackBar.open('Failed to load companies', 'Close', { duration: 5000 });
      }
    });
  }

  deleteCompany(id: number): void {
    if (confirm('Confirm to delete this company')) {
      this.companyService.deleteCompany(id).subscribe({
        next: () => {
          this.snackBar.open('Company deleted', 'Close', { duration: 5000 });
          this.loadCompanies();
        },
        error: () => {
          this.snackBar.open('Error Performing This Action', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  onEnable(companyId: number): void {
    this.companyService.enableCompany(companyId).subscribe({
      next: (company: Company) => {
        this.snackBar.open('Company enabled successfully', 'Close', { duration: 3000 });
        this.loadCompanies();
      },
      error: (error: any) => {
        this.snackBar.open(`Failed to enable company: ${error.message || 'Unknown error'}`, 'Close', { duration: 5000 });
      }
    });
  }

  onDisable(companyId: number): void {
    this.companyService.disableCompany(companyId).subscribe({
      next: (company: Company) => {
        this.snackBar.open('Company disabled successfully', 'Close', { duration: 3000 });
        this.loadCompanies();
      },
      error: (error: any) => {
        this.snackBar.open(`Failed to disable company: ${error.message || 'Unknown error'}`, 'Close', { duration: 5000 });
      }
    });
  }

  toggleAll(event: any): void {
    if (event.checked) {
      this.dataSource.data.forEach(company => this.selection.add(company));
    } else {
      this.selection.clear();
    }
  }

  toggleSelection(company: Company): void {
    if (this.selection.has(company)) {
      this.selection.delete(company);
    } else {
      this.selection.add(company);
    }
  }

  isAllSelected(): boolean {
    return this.selection.size === this.dataSource.data.length;
  }

  isSomeSelected(): boolean {
    return this.selection.size > 0 && this.selection.size < this.dataSource.data.length;
  }

  hasSelectedCompanies(): boolean {
    return this.selection.size > 0;
  }

  deleteSelectedCompanies(): void {
    // Implement if needed
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

