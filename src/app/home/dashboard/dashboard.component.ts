import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSidenav } from '@angular/material/sidenav';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthResponse } from 'src/app/auth/model/auth-response';
import { User } from 'src/app/auth/model/user';
import { AuthService } from 'src/app/auth/service/auth.service';
import { ConfirmationDialogComponent } from 'src/app/company/component/confirmation/confirmation-dialog/confirmation-dialog.component';
import { Company } from 'src/app/company/model/company';
import { CompanyService } from 'src/app/company/service/company.service';
import { InventoryItem } from 'src/app/inventory/inventoryitem/model/inventory-item';
import { InventoryItemService } from 'src/app/inventory/inventoryitem/service/inventory-item.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  /** List of companies the user can switch between */
  companies: { id: number; name: string }[] = [];
  /** Currently selected company ID */
  selectedCompanyId: number | null = null;
  /** Name of the currently selected company */
  selectedCompanyName: string = '';
  /** User authentication data from AuthService */
  userData!: AuthResponse;
  /** Inventory items for the selected company */
  inventoryItems: InventoryItem[] = [];
  /** Columns to display in the inventory table */
  inventoryColumns: string[] = ['name', 'quantity', 'price', 'totalPrice'];
  /** Reference to the sidenav component */
  @ViewChild('drawer') drawer!: MatSidenav;
  /** Reference to the paginator component */
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  /** Error message to display to the user */
  errorMessage: string = '';
  /** Currently open submenu in the sidebar */
  private openSubMenu: string = '';
  /** Dark mode state */
  isDarkMode: boolean = false;
  /** Loading state for async operations */
  loading: boolean = false;
  /** Pagination: current page size */
  pageSize: number = 10;
  /** Pagination: total number of items */
  totalItems: number = 0;

  constructor(
    private authService: AuthService,
    private companyService: CompanyService,
    private inventoryItemService: InventoryItemService,
    private router: Router,
    private dialog: MatDialog,
    private cdRef: ChangeDetectorRef
  ) {}

  /**
   * Initializes the component, checks authentication, loads user data,
   * sets initial company, and subscribes to company changes.
   */
  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
      return;
    }

    this.userData = this.authService.getUserData();
    // Map companies, handling case where companyIds might be undefined
    this.companies = this.userData.companies.map((name: string, index: number) => ({
      id: this.userData.companyIds && this.userData.companyIds[index] !== undefined 
        ? this.userData.companyIds[index] 
        : index + 1, // Fallback to index + 1 if companyIds is missing
      name
    }));

    const storedCompanyId = localStorage.getItem('selectedCompanyId');
    if (storedCompanyId) {
      this.selectedCompanyId = +storedCompanyId;
      const selectedCompany = this.companies.find(c => c.id === this.selectedCompanyId);
      if (selectedCompany) {
        this.selectedCompanyName = selectedCompany.name;
      } else {
        this.selectedCompanyName = '';
      }
    } else {
      this.selectedCompanyId = this.companies.length > 0 ? this.companies[0].id : null;
      this.selectedCompanyName = this.companies.length > 0 ? this.companies[0].name : '';
    }

    if (this.selectedCompanyId !== null) {
      this.loadCompanySpecificData(this.selectedCompanyId, 0, this.pageSize);
    }

    this.subscribeToSelectedCompany();
    this.setThemeFromLocalStorage();
  }

  /**
   * Switches the current company after user confirmation.
   * @param companyId The ID of the company to switch to
   */
  switchCompany(companyId: number): void {
    console.log('Switching to companyId:', companyId);
    const selectedCompany = this.companies.find(c => c.id === companyId);
    if (!selectedCompany) return;

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: { companyName: selectedCompany.name }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'confirm') {
        this.companyService.switchCompany(companyId).subscribe({
          next: (response) => {
            this.selectedCompanyId = companyId;
            this.selectedCompanyName = response.defaultCompany || selectedCompany.name; // Fallback to local name if undefined
            localStorage.setItem('selectedCompanyId', companyId.toString());
            this.inventoryItems = []; // Clear old inventory data
            this.loadCompanySpecificData(companyId, 0, this.pageSize);
            this.cdRef.detectChanges();
          },
          error: (error) => {
            this.errorMessage = 'Failed to switch company: ' + (error.message || 'Unknown error');
            console.error('Switch company error:', error);
          }
        });
      }
    });
  }

  /**
   * Subscribes to company selection changes from CompanyService.
   */
  subscribeToSelectedCompany(): void {
    this.companyService.getSelectedCompanyId().subscribe(
      (companyId) => {
        if (companyId !== null && companyId !== this.selectedCompanyId) {
          this.selectedCompanyId = companyId;
          const selectedCompany = this.companies.find(c => c.id === companyId);
          if (selectedCompany) {
            this.selectedCompanyName = selectedCompany.name;
          } else {
            this.selectedCompanyName = '';
          }
          this.inventoryItems = []; // Clear old inventory data
          this.loadCompanySpecificData(companyId, 0, this.pageSize);
          this.cdRef.detectChanges();
        }
      },
      (error) => {
        this.errorMessage = 'Error subscribing to selected company id: ' + (error.message || 'Unknown error');
        console.error(this.errorMessage);
      }
    );
  }

  /**
   * Loads inventory data for the specified company with pagination.
   * @param companyId The ID of the company to load data for
   * @param page The page index (0-based)
   * @param size The number of items per page
   */
  loadCompanySpecificData(companyId: number, page: number, size: number): void {
    console.log(`Fetching inventory data for company ID: ${companyId}, page: ${page}, size: ${size}`);
    this.loading = true;
    this.errorMessage = '';
    this.inventoryItemService.getAllInventoryItems(page, size).subscribe(
      (items: InventoryItem[]) => {
        this.inventoryItems = items;
        this.totalItems = items.length > 0 ? 100 : 0; // Placeholder; update with actual total from backend if available
        this.loading = false;
        this.cdRef.detectChanges();
        console.log('Inventory data loaded:', this.inventoryItems);
      },
      (error) => {
        this.errorMessage = 'Error loading inventory data: ' + (error.message || 'Unknown error');
        this.loading = false;
        console.error('Error loading inventory data:', error);
      }
    );
  }

  /**
   * Handles pagination events from MatPaginator.
   * @param event The page event containing new page index and size
   */
  handlePageEvent(event: PageEvent): void {
    this.pageSize = event.pageSize;
    const pageIndex = event.pageIndex;
    if (this.selectedCompanyId !== null) {
      this.loadCompanySpecificData(this.selectedCompanyId, pageIndex, this.pageSize);
    }
  }

  /**
   * Applies the saved theme from localStorage on initialization.
   */
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

  /** Toggles the sidenav visibility */
  toggleDrawer(): void {
    this.drawer.toggle();
  }

  /**
   * Checks if a submenu is open.
   * @param subMenu The submenu identifier
   * @returns True if the submenu is open
   */
  isSubMenuOpen(subMenu: string): boolean {
    return this.openSubMenu === subMenu;
  }

  /**
   * Toggles a submenu open or closed.
   * @param subMenu The submenu identifier
   */
  toggleSubMenu(subMenu: string): void {
    this.openSubMenu = this.openSubMenu === subMenu ? '' : subMenu;
  }

  /** Toggles between dark and light themes */
  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
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

  /** Logs out the user and navigates to the login page */
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }


  //   companies: Company[] = [];
  //   selectedCompanyId: number | null = null;
  //   selectedCompanyName: string = '';  // Variable to hold the selected company's name
  //   userData: any;
  //   displayedColumns: string[] = ['company'];
  //   @ViewChild('drawer') drawer!: MatSidenav;
  //   errorMessage: string = '';
  //   private openSubMenu: string = '';
  //   isDarkMode: boolean = false;
  
  //   constructor(
  //     private authService: AuthService, 
  //     private router: Router,
  //     private companyService: CompanyService,
  //     private dialog: MatDialog,
  //     private cdRef: ChangeDetectorRef  // Inject ChangeDetectorRef
  //   ) {}
  
  //   ngOnInit(): void {
  //     if (!this.authService.isAuthenticated()) {
  //       this.router.navigate(['/']); // Redirect to login if not authenticated
  //     }
  
  //     this.userData = this.authService.getUserData();  // Fetch user data from session
  //     this.companies = this.userData.companies.map((companyName: string, index: number) => ({
  //       id: index + 1,  // Example mapping for company ID
  //       name: companyName,
  //     }));
  
  //     // Retrieve the stored company ID from localStorage (if available)
  //     const storedCompanyId = localStorage.getItem('selectedCompanyId');
  //     if (storedCompanyId) {
  //       // If there's a stored company ID, use it
  //       this.selectedCompanyId = +storedCompanyId; // Convert string to number
  //       const selectedCompany = this.companies.find(company => company.id === this.selectedCompanyId);
  //       if (selectedCompany) {
  //         this.selectedCompanyName = selectedCompany.name;
  //       }
  //     } else {
  //       // Set the default company (first in the list or from AuthResponse)
  //       this.selectedCompanyId = this.userData.defaultCompanyId || (this.companies.length > 0 ? this.companies[0].id : null);
  //       this.selectedCompanyName = this.userData.defaultCompanyName || (this.companies.length > 0 ? this.companies[0].name : '');
  //     }
  
  //     // If a company is selected, load company-specific data
  //     if (this.selectedCompanyId) {
  //       this.loadCompanySpecificData(this.selectedCompanyId);
  //     }
  
  //     this.subscribeToSelectedCompany();
  
  //     // Handle theme preference
  //     this.setThemeFromLocalStorage();
  //   }
  
  //   setThemeFromLocalStorage(): void {
  //     const savedTheme = localStorage.getItem('theme');
  //     if (savedTheme === 'dark') {
  //       this.isDarkMode = true;
  //       document.body.classList.add('dark-mode');
  //       document.body.classList.remove('light-mode');
  //     } else {
  //       this.isDarkMode = false;
  //       document.body.classList.add('light-mode');
  //       document.body.classList.remove('dark-mode');
  //     }
  //   }
  
  //   toggleDrawer() {
  //     this.drawer.toggle();
  //   }
  
  //   isSubMenuOpen(subMenu: string): boolean {
  //     return this.openSubMenu === subMenu;
  //   }
  
  //   toggleSubMenu(subMenu: string) {
  //     this.openSubMenu = this.openSubMenu === subMenu ? '' : subMenu;
  //   }
  
  //   toggleTheme(): void {
  //     this.isDarkMode = !this.isDarkMode;
  
  //     // Add or remove the dark mode class on the body
  //     if (this.isDarkMode) {
  //       document.body.classList.remove('light-mode');
  //       document.body.classList.add('dark-mode');
  //       localStorage.setItem('theme', 'dark');
  //     } else {
  //       document.body.classList.remove('dark-mode');
  //       document.body.classList.add('light-mode');
  //       localStorage.setItem('theme', 'light');
  //     }  
  //   }
  
  //   selectCompany(companyId: number): void {
  //     this.companyService.switchCompany(companyId);
  //   }
  
  //   // switchCompany(companyId: number): void {
  //   //   const selectedCompany = this.companies.find(company => company.id === companyId);
  //   //   if (!selectedCompany) return;
    
  //   //   // Show the confirmation dialog before switching the company
  //   //   const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
  //   //     width: '400px',
  //   //     data: {
  //   //       companyName: selectedCompany.name
  //   //     }
  //   //   });
    
  //   //   dialogRef.afterClosed().subscribe(result => {
  //   //     if (result === 'confirm') {
  //   //       // User confirmed the company switch
  //   //       this.selectedCompanyId = companyId;
  //   //       this.selectedCompanyName = selectedCompany.name;
    
  //   //       // Store the selected company ID in localStorage
  //   //       localStorage.setItem('selectedCompanyId', companyId.toString());
    
  //   //       // Call the company service to switch the company
  //   //       this.companyService.switchCompany(companyId);
    
  //   //       // Redirect to the dashboard to ensure correct routing
  //   //       this.router.navigate(['/dashboard']).then(() => {
  //   //         // Once navigation is successful, reload the page to fetch the company-specific data
  //   //         window.location.reload();
  //   //       });
    
  //   //       // Optionally, you could call loadCompanySpecificData again, but this may be redundant
  //   //       // this.loadCompanySpecificData(companyId);
    
  //   //       // Trigger Angular's change detection to ensure UI reflects the changes immediately
  //   //       this.cdRef.detectChanges();
  //   //     }
  //   //   });
  //   // }

  //   switchCompany(companyId: number): void {
  //     const selectedCompany = this.companies.find(company => company.id === companyId);
  //     if (!selectedCompany) return;
  
  //     const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
  //         width: '400px',
  //         data: { companyName: selectedCompany.name }
  //     });
  
  //     dialogRef.afterClosed().subscribe(result => {
  //         if (result === 'confirm') {
  //             this.authService.switchCompany(companyId).subscribe(
  //                 (response) => {
  //                     this.selectedCompanyId = companyId;
  //                     this.selectedCompanyName = selectedCompany.name;
  //                     localStorage.setItem('selectedCompanyId', companyId.toString());
  //                     this.loadCompanySpecificData(companyId);
  //                     this.cdRef.detectChanges();
  //                 },
  //                 (error) => {
  //                     this.errorMessage = 'Failed to switch company';
  //                 }
  //             );
  //         }
  //     });
  // }
    
  
  //   subscribeToSelectedCompany(): void {
  //     this.companyService.getSelectedCompanyId().subscribe(
  //       (companyId) => {
  //         this.selectedCompanyId = companyId;
  //         if (companyId !== null) {
  //           this.loadCompanySpecificData(companyId);
  //         }
  //       },
  //       (error) => {
  //         this.errorMessage = 'Error subscribing to selected company id: ' + error;
  //         console.error(this.errorMessage);
  //       }
  //     );
  //   }
  
  //   loadCompanySpecificData(companyId: number): void {
  //     console.log(`Fetching additional data for company ID: ${companyId}`);
  //     this.companyService.getCompanyById(companyId).subscribe(
  //       (data: Company) => {
  //         console.log('Company data loaded:', data);
  //         // Handle your company-specific data here
  //       },
  //       (error: any) => {
  //         console.error('Error loading company data:', error);
  //         this.errorMessage = 'Error loading company-specific data.';
  //       }
  //     );
  //   }
  
  //   logout(): void {
  //     this.authService.logout();
  //     this.router.navigate(['/']); // Redirect to login page
  //   }
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