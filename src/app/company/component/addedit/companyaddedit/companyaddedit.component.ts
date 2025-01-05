import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Company } from 'src/app/company/model/company';
import { CompanyService } from 'src/app/company/service/company.service';

@Component({
  selector: 'app-companyaddedit',
  templateUrl: './companyaddedit.component.html',
  styleUrls: ['./companyaddedit.component.css']
})
export class CompanyaddeditComponent implements OnInit {
  companyForm: FormGroup = new FormGroup({});
  isEditMode: boolean = false;
  companyId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private companyService: CompanyService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.companyForm = this.fb.group({
      name: ['', Validators.required]
    });

    // Check if we are in edit mode or add mode
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.companyId = +id;
        this.loadCompanyDetails();
      } else {
        this.isEditMode = false;
      }
    });
  }
  
  loadCompany(): void {
    // Use the companyService to fetch the data for the given companyId
    // Ensure you handle the case where company is null or undefined
  }

  loadCompanyDetails(): void {
    if (this.companyId) {
      this.companyService.getCompanyById(this.companyId).subscribe(
        (company: Company) => {
          this.companyForm.patchValue(company);
        },
        (error) => {
          this.snackBar.open('Failed to load company details', 'Close', { duration: 5000 });
        }
      );
    }
  }

  saveCompany(): void {
    if (this.companyForm.invalid) {
      return;
    }
  
    const companyData: Company = this.companyForm.value;
  
    if (this.isEditMode && this.companyId) {
      companyData.id = this.companyId;  // Ensure ID is added for update
      this.companyService.updateCompany(companyData).subscribe(
        () => {
          this.snackBar.open('Company updated successfully', 'Close', { duration: 5000 });
          this.router.navigate(['/companies']);
        },
        (error: HttpErrorResponse) => { // Explicitly typing the error
          this.snackBar.open('Failed to update company', 'Close', { duration: 5000 });
        }
      );
    } else {
      this.companyService.createCompany(companyData).subscribe(
        () => {
          this.snackBar.open('Company created successfully', 'Close', { duration: 5000 });
          this.router.navigate(['/companies']);
        },
        (error: HttpErrorResponse) => { // Explicitly typing the error
          this.snackBar.open('Failed to create company', 'Close', { duration: 5000 });
        }
      );
    }
  }
}
