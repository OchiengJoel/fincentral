import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Company } from 'src/app/company/model/company';
import { CompanyService } from 'src/app/company/service/company.service';
import { CompanyaddeditComponent } from '../../addedit/companyaddedit/companyaddedit.component';

@Component({
  selector: 'app-companylist',
  templateUrl: './companylist.component.html',
  styleUrls: ['./companylist.component.css']
})
export class CompanylistComponent implements OnInit {

  title: string;
  displayedColumns: string[] = ["name"];
  //displayedColumns: string[] = ["companyName", "email", "contact", "country", "city", "action"];
  dataSource: MatTableDataSource<Company> = new MatTableDataSource<Company>([]);
  selectedCompanyId: number | null = null;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private companyService: CompanyService,
    private dialog: MatDialog,
    private snackbar: MatSnackBar
  ) { 
    this.title = "Company List";
    this.companyService.getSelectedCompanyId().subscribe(id => {
      this.selectedCompanyId = id;
      // Load company-specific data based on the selected company ID
    });
  }

  ngOnInit(): void {
    this.fetchCompanies();
  }

  openFormDialog(company?: Company): void {
    const dialogRef = this.dialog.open(CompanyaddeditComponent, {
      width: '600px',
      data: company
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fetchCompanies();
      }
    });
  }  

  fetchCompanies(): void {
    this.companyService.getCompanies().subscribe(companies => {
      this.dataSource.data = companies;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }  

  deleteCompany(id: number): void {
    let confirm = window.confirm("Are you sure you want to delete selected item?");
    if (confirm) {
      this.companyService.deleteCompany(id).subscribe({
        next: (res) => {
          alert("Company Deleted");
          this.fetchCompanies();
        },
        error(err) {
          console.log(err);
        },
      });
    }
  }


  switchCompany(companyId: number): void {
    this.companyService.switchCompany(companyId);
    // Logic to refresh data based on the selected company can be added here
  }

}
