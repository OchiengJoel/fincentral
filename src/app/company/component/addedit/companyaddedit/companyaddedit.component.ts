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
      name: ['', [Validators.required]]
    });
  
    this.companyId = this.route.snapshot.params['id'];
    if (this.companyId) {
      this.isEditMode = true;
      // Fetch company data and populate form for edit
      this.loadCompany();
    }
  }
  
  loadCompany(): void {
    // Use the companyService to fetch the data for the given companyId
    // Ensure you handle the case where company is null or undefined
  }

  saveCompany(): void {
    if (this.companyForm.invalid) {
      return;
    }
  
    const company: Company = this.companyForm.value;
    if (this.isEditMode) {
      // Call update service
    } else {
      this.companyService.createCompany(company).subscribe(
        () => {
          this.snackBar.open('Company created successfully', 'Close', { duration: 5000 });
          this.router.navigate(['/companies']);
        },
        () => {
          this.snackBar.open('Failed to create company', 'Close', { duration: 5000 });
        }
      );
    }
  }
}
