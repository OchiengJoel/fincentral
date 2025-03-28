import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSidenav } from '@angular/material/sidenav';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AuthResponse,
  ModulePermission,
} from 'src/app/auth/model/auth-response';
import { User } from 'src/app/auth/model/user';
import { AuthService } from 'src/app/auth/service/auth.service';
import { ConfirmationDialogComponent } from 'src/app/company/component/confirmation/confirmation-dialog/confirmation-dialog.component';
import { Company } from 'src/app/company/model/company';
import { CompanyService } from 'src/app/company/service/company.service';
import {
  InventoryItem,
  PaginatedResponse,
} from 'src/app/inventory/inventoryitem/model/inventory-item';
import { InventoryItemService } from 'src/app/inventory/inventoryitem/service/inventory-item.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  companies: { id: number; name: string }[] = [];
  selectedCompanyId: number | null = null;
  selectedCompanyName: string = '';
  userData!: AuthResponse;
  inventoryItems: InventoryItem[] = [];
  inventoryColumns: string[] = ['name', 'quantity', 'price', 'totalPrice'];
  @ViewChild('drawer') drawer!: MatSidenav;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  errorMessage: string = '';
  isDarkMode: boolean = false;
  loading: boolean = false;
  pageSize: number = 10;
  totalItems: number = 0;
  selectedModule!: ModulePermission | undefined;
  private openSubMenus: Set<string> = new Set<string>();

  constructor(
    private authService: AuthService,
    private companyService: CompanyService,
    private inventoryItemService: InventoryItemService,
    public router: Router,
    private dialog: MatDialog,
    private cdRef: ChangeDetectorRef,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
      return;
    }

    this.userData = this.authService.getUserData();
    this.companies = this.userData.companies.map((name, index) => ({
      id: this.userData.companyIds?.[index] ?? index + 1,
      name,
    }));

    this.route.paramMap.subscribe(params => {
      const moduleId = params.get('moduleId');
      this.selectedModule = this.userData.modules.find(m => m.moduleId === moduleId);
      if (!this.selectedModule) {
        this.snackBar.open('Invalid module selected.', 'Close', { duration: 5000 });
        this.router.navigate(['/modules']);
        return;
      }

      this.companyService.getSelectedCompanyId().subscribe((companyId) => {
        this.selectedCompanyId = companyId;
        this.selectedCompanyName = this.companies.find((c) => c.id === companyId)?.name ?? '';
        if (companyId !== null) {
          this.loadModuleData(companyId, 0, this.pageSize);
        }
      });
    });

    this.setThemeFromLocalStorage();
  }

  loadModuleData(companyId: number, page: number, size: number): void {
    this.loading = true;
    this.errorMessage = '';
    if (this.selectedModule?.moduleId === 'inventory') {
      this.inventoryItemService.getAllInventoryItems(page, size).subscribe({
        next: (response: PaginatedResponse<InventoryItem>) => {
          this.inventoryItems = response.items;
          this.totalItems = response.totalItems;
          this.loading = false;
          this.cdRef.detectChanges();
        },
        error: (error) => {
          this.errorMessage = `Error loading inventory data: ${error.message || 'Unknown error'}`;
          this.loading = false;
          this.snackBar.open(this.errorMessage, 'Close', { duration: 5000 });
        },
      });
    } else if (this.selectedModule?.moduleId === 'car-sales') {
      this.loading = false;
      this.snackBar.open('Car Sales data not yet implemented.', 'Close', { duration: 5000 });
    }
  }

  handlePageEvent(event: PageEvent): void {
    this.pageSize = event.pageSize;
    if (this.selectedCompanyId !== null) {
      this.loadModuleData(this.selectedCompanyId, event.pageIndex, this.pageSize);
    }
  }

  switchCompany(companyId: number): void {
    const selectedCompany = this.companies.find((c) => c.id === companyId);
    if (!selectedCompany) return;

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: { companyName: selectedCompany.name },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'confirm') {
        this.loading = true;
        this.companyService.switchCompany(companyId).subscribe({
          next: () => {
            this.loading = false;
            this.router.navigate(['/modules']);
          },
          error: (error) => {
            this.loading = false;
            this.errorMessage = `Failed to switch company: ${error.message || 'Unknown error'}`;
            this.snackBar.open(this.errorMessage, 'Close', { duration: 5000 });
          },
        });
      }
    });
  }

  navigateToEntity(entityId: string): void {
    const basePath = `/dashboard/${this.selectedModule?.moduleId}`;
    const routeMap: { [key: string]: string } = {
      'inventory-items': 'inventory-item',
      'item-categories': 'item-category'
      // Add more mappings as needed, e.g., 'item-types': 'item-type'
    };
    const routePath = routeMap[entityId] || entityId; // Fallback to entityId if no mapping
    console.log(`Navigating to: ${basePath}/${routePath}`, { entityId, routePath });
    this.router.navigate([`${basePath}/${routePath}`]);
  }

  toggleDrawer(): void {
    this.drawer.toggle();
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    document.body.classList.toggle('dark-mode', this.isDarkMode);
    document.body.classList.toggle('light-mode', !this.isDarkMode);
  }

  logout(): void {
    this.authService.logout();
  }

  toggleSubMenu(submenuId: string): void {
    if (this.openSubMenus.has(submenuId)) {
      this.openSubMenus.delete(submenuId);
    } else {
      this.openSubMenus.add(submenuId);
    }
    this.cdRef.detectChanges();
  }

  isSubMenuOpen(submenuId: string): boolean {
    return this.openSubMenus.has(submenuId);
  }

  private setThemeFromLocalStorage(): void {
    this.isDarkMode = localStorage.getItem('theme') === 'dark';
    document.body.classList.toggle('dark-mode', this.isDarkMode);
    document.body.classList.toggle('light-mode', !this.isDarkMode);
  }
}


//   this.userData = this.authService.getUserData();
  //   this.companies = this.userData.companies.map((name, index) => ({
  //     id: this.userData.companyIds?.[index] ?? index + 1,
  //     name,
  //   }));

  //   this.companyService.getSelectedCompanyId().subscribe((companyId) => {
  //     this.selectedCompanyId = companyId;
  //     this.selectedCompanyName =
  //       this.companies.find((c) => c.id === companyId)?.name ?? '';
  //     if (companyId !== null) {
  //       this.loadCompanySpecificData(companyId, 0, this.pageSize);
  //     }
  //   });

  //   this.setThemeFromLocalStorage();
  // }

  // /**
  //  * Switches the active company with user confirmation by reloading the page.
  //  * @param companyId The ID of the company to switch to.
  //  */
  // switchCompany(companyId: number): void {
  //   const selectedCompany = this.companies.find((c) => c.id === companyId);
  //   if (!selectedCompany) return;

  //   const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
  //     width: '400px',
  //     data: { companyName: selectedCompany.name },
  //   });

  //   dialogRef.afterClosed().subscribe((result) => {
  //     if (result === 'confirm') {
  //       this.companyService.switchCompany(companyId).subscribe({
  //         next: () => {
  //           window.location.reload(); // Page reload here
  //         },
  //         error: (error) => {
  //           this.errorMessage = `Failed to switch company: ${
  //             error.message || 'Unknown error'
  //           }`;
  //         },
  //       });
  //     }
  //   });
  // }

  // /**
  //  * Loads inventory data for the selected company.
  //  * @param companyId The company ID.
  //  * @param page The page index.
  //  * @param size The page size.
  //  */
  // loadCompanySpecificData(companyId: number, page: number, size: number): void {
  //   this.loading = true;
  //   this.errorMessage = '';
  //   this.inventoryItemService.getAllInventoryItems(page, size).subscribe({
  //     next: (response: PaginatedResponse<InventoryItem>) => {
  //       this.inventoryItems = response.items;
  //       this.totalItems = response.totalItems;
  //       this.loading = false;
  //       this.cdRef.detectChanges();
  //     },
  //     error: (error) => {
  //       this.errorMessage = `Error loading inventory data: ${
  //         error.message || 'Unknown error'
  //       }`;
  //       this.loading = false;
  //     },
  //   });
  // }

  /**
   * Handles pagination events.
   * @param event The page event.
   */
  // handlePageEvent(event: PageEvent): void {
  //   this.pageSize = event.pageSize;
  //   if (this.selectedCompanyId !== null) {
  //     this.loadCompanySpecificData(
  //       this.selectedCompanyId,
  //       event.pageIndex,
  //       this.pageSize
  //     );
  //   }
  // }










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
