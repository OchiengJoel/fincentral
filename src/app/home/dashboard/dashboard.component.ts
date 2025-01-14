import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSidenav } from '@angular/material/sidenav';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { User } from 'src/app/auth/model/user';
import { AuthService } from 'src/app/auth/service/auth.service';
import { ConfirmationDialogComponent } from 'src/app/company/component/confirmation/confirmation-dialog/confirmation-dialog.component';
import { Company } from 'src/app/company/model/company';
import { CompanyService } from 'src/app/company/service/company.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {


    companies: Company[] = [];
    selectedCompanyId: number | null = null;
    selectedCompanyName: string = '';  // Variable to hold the selected company's name
    userData: any;
    displayedColumns: string[] = ['company'];
    @ViewChild('drawer') drawer!: MatSidenav;
    errorMessage: string = '';
    private openSubMenu: string = '';
    isDarkMode: boolean = false;
  
    constructor(
      private authService: AuthService, 
      private router: Router,
      private companyService: CompanyService,
      private dialog: MatDialog,
      private cdRef: ChangeDetectorRef  // Inject ChangeDetectorRef
    ) {}
  
    ngOnInit(): void {
      if (!this.authService.isAuthenticated()) {
        this.router.navigate(['/']); // Redirect to login if not authenticated
      }
  
      this.userData = this.authService.getUserData();  // Fetch user data from session
      this.companies = this.userData.companies.map((companyName: string, index: number) => ({
        id: index + 1,  // Example mapping for company ID
        name: companyName,
      }));
  
      // Retrieve the stored company ID from localStorage (if available)
      const storedCompanyId = localStorage.getItem('selectedCompanyId');
      if (storedCompanyId) {
        // If there's a stored company ID, use it
        this.selectedCompanyId = +storedCompanyId; // Convert string to number
        const selectedCompany = this.companies.find(company => company.id === this.selectedCompanyId);
        if (selectedCompany) {
          this.selectedCompanyName = selectedCompany.name;
        }
      } else {
        // Set the default company (first in the list or from AuthResponse)
        this.selectedCompanyId = this.userData.defaultCompanyId || (this.companies.length > 0 ? this.companies[0].id : null);
        this.selectedCompanyName = this.userData.defaultCompanyName || (this.companies.length > 0 ? this.companies[0].name : '');
      }
  
      // If a company is selected, load company-specific data
      if (this.selectedCompanyId) {
        this.loadCompanySpecificData(this.selectedCompanyId);
      }
  
      this.subscribeToSelectedCompany();
  
      // Handle theme preference
      this.setThemeFromLocalStorage();
    }
  
    setThemeFromLocalStorage(): void {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark') {
        this.isDarkMode = true;
        document.body.classList.add('dark-mode');
        document.body.classList.remove('light-mode');
      } else {
        this.isDarkMode = false;
        document.body.classList.add('light-mode');
        document.body.classList.remove('dark-mode');
      }
    }
  
    toggleDrawer() {
      this.drawer.toggle();
    }
  
    isSubMenuOpen(subMenu: string): boolean {
      return this.openSubMenu === subMenu;
    }
  
    toggleSubMenu(subMenu: string) {
      this.openSubMenu = this.openSubMenu === subMenu ? '' : subMenu;
    }
  
    toggleTheme(): void {
      this.isDarkMode = !this.isDarkMode;
  
      // Add or remove the dark mode class on the body
      if (this.isDarkMode) {
        document.body.classList.remove('light-mode');
        document.body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
      } else {
        document.body.classList.remove('dark-mode');
        document.body.classList.add('light-mode');
        localStorage.setItem('theme', 'light');
      }  
    }
  
    selectCompany(companyId: number): void {
      this.companyService.switchCompany(companyId);
    }
  
    switchCompany(companyId: number): void {
      const selectedCompany = this.companies.find(company => company.id === companyId);
      if (!selectedCompany) return;
    
      // Show the confirmation dialog before switching the company
      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        width: '400px',
        data: {
          companyName: selectedCompany.name
        }
      });
    
      dialogRef.afterClosed().subscribe(result => {
        if (result === 'confirm') {
          // User confirmed the company switch
          this.selectedCompanyId = companyId;
          this.selectedCompanyName = selectedCompany.name;
    
          // Store the selected company ID in localStorage
          localStorage.setItem('selectedCompanyId', companyId.toString());
    
          // Call the company service to switch the company
          this.companyService.switchCompany(companyId);
    
          // Redirect to the dashboard to ensure correct routing
          this.router.navigate(['/dashboard']).then(() => {
            // Once navigation is successful, reload the page to fetch the company-specific data
            window.location.reload();
          });
    
          // Optionally, you could call loadCompanySpecificData again, but this may be redundant
          // this.loadCompanySpecificData(companyId);
    
          // Trigger Angular's change detection to ensure UI reflects the changes immediately
          this.cdRef.detectChanges();
        }
      });
    }
    
  
    subscribeToSelectedCompany(): void {
      this.companyService.getSelectedCompanyId().subscribe(
        (companyId) => {
          this.selectedCompanyId = companyId;
          if (companyId !== null) {
            this.loadCompanySpecificData(companyId);
          }
        },
        (error) => {
          this.errorMessage = 'Error subscribing to selected company id: ' + error;
          console.error(this.errorMessage);
        }
      );
    }
  
    loadCompanySpecificData(companyId: number): void {
      console.log(`Fetching additional data for company ID: ${companyId}`);
      this.companyService.getCompanyById(companyId).subscribe(
        (data: Company) => {
          console.log('Company data loaded:', data);
          // Handle your company-specific data here
        },
        (error: any) => {
          console.error('Error loading company data:', error);
          this.errorMessage = 'Error loading company-specific data.';
        }
      );
    }
  
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