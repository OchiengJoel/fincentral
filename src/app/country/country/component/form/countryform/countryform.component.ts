import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CountryService } from '../../../service/country.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Country } from '../../../model/country';

@Component({
  selector: 'app-countryform',
  templateUrl: './countryform.component.html',
  styleUrls: ['./countryform.component.css']
})
export class CountryformComponent implements OnInit {

  countryForm: FormGroup = new FormGroup({});
  isEditMode: boolean = false;
  countryId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private countryService: CountryService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.countryForm = this.fb.group({
      name: ['', Validators.required],
      code: ['', Validators.required],
      continent: [ '', Validators.required]
    });

    // Check if we are in edit mode or add mode
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.countryId = +id;
        this.loadCountryDetails;
      } else {
        this.isEditMode = false;
      }
    });
  }

  loadCountry(): void {
    // Use the companyService to fetch the data for the given companyId
    // Ensure you handle the case where company is null or undefined
  }

  loadCountryDetails(): void {
    if (this.countryId) {
      this.countryService.getCountryById(this.countryId).subscribe(
        (country: Country) => {
          this.countryForm.patchValue(country);
        },
        (error) => {
          this.snackBar.open('Failed to load company details', 'Close', { duration: 5000 });
        }
      );
    }
  }

  saveCountry(): void {
    if (this.countryForm.invalid) {
      return;
    }

    const countryData: Country = this.countryForm.value;

    if (this.isEditMode && this.countryId) {
      countryData.id = this.countryId;  // Make sure the ID is added for update
      this.countryService.updateCountry(countryData).subscribe(
        () => {
          this.snackBar.open('Country updated successfully', 'Close', { duration: 5000 });
          this.router.navigate(['dashboard/countries']);  // This should work
        },
        (error) => {
          this.snackBar.open('Failed to update country', 'Close', { duration: 5000 });
        }
      );
    } else {
      this.countryService.createCountry(countryData).subscribe(
        () => {
          this.snackBar.open('Country created successfully', 'Close', { duration: 5000 });
          this.router.navigate(['/dashboard/countries']);  // This should work
        },
        (error) => {
          this.snackBar.open('Failed to create country', 'Close', { duration: 5000 });
        }
      );
    }
  }
}



