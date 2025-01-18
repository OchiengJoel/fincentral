import { Country } from "src/app/country/country/model/country";

export interface Company {
  id: number;
  name: string;
  primaryEmail: string;
  secondaryEmail: string;
  primaryContact: string;
  secondaryContact: string;
  countryId: number;  // countryId as a number (ID of the country)
  countryName: string; // The country name (added)
  town: string;
  address: string;
  registration: string;
  tax_id: string;
  status: boolean;
}

  
  export interface CompanyPage {
    content: Company[];
    pageable: any;
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
  }