import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Company } from 'src/app/company/model/company';
import { CompanyService } from 'src/app/company/service/company.service';
import { Country, CountryPage } from 'src/app/country/country/model/country';
import { CountryService } from 'src/app/country/country/service/country.service';

@Component({
  selector: 'app-companyaddedit',
  templateUrl: './companyaddedit.component.html',
  styleUrls: ['./companyaddedit.component.css'],
})
export class CompanyaddeditComponent implements OnInit {
  companyForm: FormGroup;
  countries: Country[] = [];
  companyId: string | null = null;
  isEditMode: boolean = false;

  constructor(
    private fb: FormBuilder,
    private companyService: CompanyService,
    private countryService: CountryService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.companyForm = this.fb.group({
      name: ['', Validators.required],
      countryId: ['', Validators.required],
      primaryEmail: ['', [Validators.required, Validators.email]],
      secondaryEmail: ['', [Validators.email]],
      primaryContact: ['', Validators.required],
      secondaryContact: ['', Validators.required],
      town: ['', Validators.required],
      address: ['', Validators.required],
      registration: ['', Validators.required],
      tax_id: ['', Validators.required],
      status: [true],
    });
  }

  ngOnInit(): void {
    // Get countries for dropdown
    this.countryService.getCountries().subscribe({
      next: (data: Country[]) => {
        this.countries = data;
      },
      error: () => {
        this.snackBar.open('Failed to load countries', 'Close', {
          duration: 5000,
        });
      },
    });

    // Check if we're editing an existing company
    this.route.paramMap.subscribe((params) => {
      this.companyId = params.get('id');
      if (this.companyId) {
        this.isEditMode = true;
        this.loadCompanyDetails(Number(this.companyId));
      }
    });
  }

  loadCompanyDetails(id: number): void {
    this.companyService.getCompanyById(id).subscribe({
      next: (company: Company) => {
        this.companyForm.patchValue(company);
      },
      error: () => {
        this.snackBar.open('Failed to load company details', 'Close', {
          duration: 5000,
        });
      },
    });
  }

  saveCompany(): void {
    if (this.companyForm.invalid) {
      this.snackBar.open('Please fill in all required fields.', 'Close', {
        duration: 5000,
      });
      return;
    }

    const companyToSave: Company = {
      ...this.companyForm.value,
      id: this.companyId ? Number(this.companyId) : 0, // Use 0 for new companies; backend should ignore it
      countryName: '', // Placeholder; backend should populate this or remove if not needed
    };

    if (this.isEditMode) {
      this.companyService.updateCompany(companyToSave).subscribe({
        next: (response: Company) => {
          this.snackBar.open('Company updated successfully!', 'Close', {
            duration: 5000,
          });
          this.router.navigate(['/dashboard/companies']);
        },
        error: () => {
          this.snackBar.open('Failed to update company.', 'Close', {
            duration: 5000,
          });
        },
      });
    } else {
      this.companyService.createCompany(companyToSave).subscribe({
        next: (response: Company) => {
          this.snackBar.open('Company created successfully!', 'Close', {
            duration: 5000,
          });
          this.router.navigate(['/dashboard/companies']);
        },
        error: () => {
          this.snackBar.open('Failed to create company.', 'Close', {
            duration: 5000,
          });
        },
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/dashboard/companies']);
  }
}

// ngOnInit(): void {
//   this.companyForm = this.fb.group({
//     name: ['', Validators.required],
//     primaryEmail: ['', [Validators.required, Validators.email]],
//     secondaryEmail: ['', [Validators.email]],
//     primaryContact: ['', Validators.required],
//     secondaryContact: ['', Validators.required],
//     country: [null, Validators.required], // Country will hold only the id (number)
//     town: ['', Validators.required],
//     address: ['', Validators.required],
//     registration: ['', Validators.required],
//     tax_id: ['', Validators.required],
//     status: [true]  // Default to true (active)
//   });

//   // Fetch the countries when the component is initialized
//   this.loadCountries();

//   // Check if we are in edit mode or add mode
//   this.route.paramMap.subscribe(params => {
//     const id = params.get('id');
//     if (id) {
//       this.isEditMode = true;
//       this.companyId = +id;
//       this.loadCompanyDetails();
//     } else {
//       this.isEditMode = false;
//     }
//   });
// }

// Method to load countries from the backend
// loadCountries(): void {
//   this.countryService.getCountries().subscribe(
//     (response) => {
//       this.countries = response.content;  // Assuming `content` is the array of countries
//     },
//     (error: HttpErrorResponse) => {
//       this.snackBar.open('Failed to load countries', 'Close', { duration: 5000 });
//     }
//   );
// }

// Method to load company details if editing
// loadCompanyDetails(): void {
//   if (this.companyId) {
//     this.companyService.getCompanyById(this.companyId).subscribe(
//       (company: Company) => {
//         this.companyForm.patchValue(company); // Populate form with data
//         // Ensure the country is set in the form from the fetched company data
//         if (company.country) {
//           this.companyForm.get('country')?.setValue(company.country.id);  // Set only the country id in the form
//         }
//       },
//       (error: HttpErrorResponse) => {
//         this.snackBar.open('Failed to load company details', 'Close', { duration: 5000 });
//       }
//     );
//   }
// }

// loadCompanyDetails(): void {
//   if (this.companyId) {
//     this.companyService.getCompanyById(this.companyId).subscribe(
//       (company: Company) => {
//         this.companyForm.patchValue(company); // Populate form with data
//         // Set only the countryId (number) in the form
//         if (company.country) {
//           this.companyForm.get('country')?.setValue(company.country);  // Directly set the countryId
//         }
//       },
//       (error: HttpErrorResponse) => {
//         this.snackBar.open('Failed to load company details', 'Close', { duration: 5000 });
//       }
//     );
//   }
// }

// In the saveCompany method
// saveCompany(): void {
//   if (this.companyForm.invalid) {
//     return;
//   }

//   const companyData: Company = this.companyForm.value;

//   // No need to find the country, just pass the countryId (which is a number)
//   if (this.isEditMode && this.companyId) {
//     companyData.id = this.companyId;  // Ensure the ID is set for updating
//     this.companyService.updateCompany(companyData).subscribe(
//       () => {
//         this.snackBar.open('Company updated successfully', 'Close', { duration: 5000 });
//         this.router.navigate(['/dashboard/companies']);
//       },
//       (error) => {
//         this.snackBar.open('Failed to update company', 'Close', { duration: 5000 });
//       }
//     );
//   } else {
//     this.companyService.createCompany(companyData).subscribe(
//       () => {
//         this.snackBar.open('Company created successfully', 'Close', { duration: 5000 });
//         this.router.navigate(['/dashboard/companies']);
//       },
//       (error) => {
//         this.snackBar.open('Failed to create company', 'Close', { duration: 5000 });
//       }
//     );
//   }}

// saveCompany(): void {
//   if (this.companyForm.invalid) {
//     return;
//   }

//   const companyData: Company = this.companyForm.value;

//   if (this.isEditMode && this.companyId) {
//     companyData.id = this.companyId;  // Ensure the ID is present for update
//     this.companyService.updateCompany(companyData).subscribe(
//       () => {
//         this.snackBar.open('Company updated successfully', 'Close', { duration: 5000 });
//         this.router.navigate(['dashboard/companies']); // Redirect to the company list
//       },
//       (error: HttpErrorResponse) => {
//         this.snackBar.open('Failed to update company', 'Close', { duration: 5000 });
//       }
//     );
//   } else {
//     this.companyService.createCompany(companyData).subscribe(
//       () => {
//         this.snackBar.open('Company created successfully', 'Close', { duration: 5000 });
//         this.router.navigate(['/dashboard/companies']); // Redirect to the company list
//       },
//       (error: HttpErrorResponse) => {
//         this.snackBar.open('Failed to create company', 'Close', { duration: 5000 });
//       }
//     );
//   }
// }
