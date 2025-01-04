import { Component, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/service/auth.service';
import { Company } from 'src/app/company/model/company';
import { CompanyService } from 'src/app/company/service/company.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {

  //companies!: Company[];  
    companies: Company[] = [];
    selectedCompanyId: number | null = null;
    userData: any;
    displayedColumns: string[] = ['company']; // Define the columns to display in the mat-table
    errorMessage: string = ''; // Ensure 'errorMessage' is declared
    private openSubMenu: string = '';
  
    constructor(
      private authService: AuthService, 
      private router: Router,
      private companyService: CompanyService
    
    ) {}
  
    ngOnInit(): void {
      if (!this.authService.isAuthenticated()) {
        this.router.navigate(['/']); // Redirect to login if not authenticated
      }
  
      this.userData = this.authService.getUserData(); // Get user data from localStorage
  
       // Fetch the companies the user can access
       this.companies = this.userData.companies.map((companyName: string, index: number) => ({
        id: index + 1, // Example mapping for company ID
        name: companyName,
      }));
    }    
  
  }


