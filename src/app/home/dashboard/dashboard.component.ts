import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { User } from 'src/app/auth/model/user';
import { AuthService } from 'src/app/auth/service/auth.service';
import { Company } from 'src/app/company/model/company';
import { CompanyService } from 'src/app/company/service/company.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {


  //companies!: Company[];  
  companies: Company[] = [];
  selectedCompanyId: number | null = null;
  userData: any;
  displayedColumns: string[] = ['company']; // Define the columns to display in the mat-table
  @ViewChild('drawer') drawer!: MatSidenav;
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

  toggleDrawer(){
    this.drawer.toggle();
  }

  isSubMenuOpen(subMenu: string): boolean {
    return this.openSubMenu === subMenu;
  }

  toggleSubMenu(subMenu: string) {
    this.openSubMenu = this.openSubMenu === subMenu ? '' : subMenu;
  }

  selectCompany(companyId: number): void {
    this.companyService.switchCompany(companyId);
  }

  // switchCompany(companyId: number): void {
  //   this.companyService.switchCompany(companyId);
  //   // Logic to refresh data based on the selected company can be added here
  // }

  switchCompany(companyId: number): void {
    this.selectedCompanyId = companyId;
    this.companyService.switchCompany(companyId);

    // Load data specific to the selected company
    this.loadCompanySpecificData(companyId);
  }

  subscribeToSelectedCompany(): void {
    this.companyService.getSelectedCompanyId().subscribe(
      (companyId) => {
        this.selectedCompanyId = companyId;
        if (companyId !== null) {
          this.loadCompanySpecificData(companyId); // Ensure companyId is not null
        }
      },
      (error) => {
        this.errorMessage = 'Error subscribing to selected company id: ' + error;
        console.error(this.errorMessage);
      }
    );
  }

  loadCompanySpecificData(companyId: number): void {
    // Example: Fetch additional data based on the selected company ID
    // Replace with your actual implementation
    console.log(`Fetching additional data for company ID: ${companyId}`);
    // Implement your data loading logic here
    // For example:
    // this.companyService.getBranches(companyId).subscribe(...);
    // this.companyService.getWeightBands(companyId).subscribe(...);
    // this.companyService.getParcels(companyId).subscribe(...);
  } 

  // Logout the user and navigate to the login page
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']); // Redirect to login page
  }
}

  // ngOnInit(): void {
  //   this.authService.getUserDetails().subscribe(
  //     data => {
  //       this.userDetails = data;
  //       this.loading = false; // Set loading to false once data is loaded
  //     },
  //     error => {
  //       this.snackBar.open('Error Loading User Profile Data', 'Close', { duration: 6000 });
  //       this.loading = false; // Set loading to false even if there is an error, so the UI doesn't remain in loading state.
  //     }
  //   );
  // }

  


  

  // ngOnInit(): void {
  //   this.authService.getUserDetails().subscribe(
  //     (response) => {
  //       this.userDetails = response;
  //       this.loading = false;  // Set loading to false once data is loaded
  //     },
  //     (error) => {
  //       console.error('Error fetching user details', error);
  //       this.loading = false;  // Stop loading on error
  //     }
  //   );
  // }



// currentUser: any;
  // isAuthenticated: boolean = false;

  // constructor(private authService: AuthService, private router: Router) {}

  // ngOnInit() {
  //   this.currentUser = this.authService.currentUserValue;

  //   if (!this.currentUser) {
  //     this.router.navigate(['/login']); // Redirect to login if no user is authenticated
  //   } else {
  //     this.isAuthenticated = true;
  //   }
  // }