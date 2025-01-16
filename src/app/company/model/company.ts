import { Country } from "src/app/country/country/model/country";

export interface Company {
    id: number;
    name: string;
    primaryEmail: string;
    secondaryEmail: string;
    primaryContact: string;
    secondaryContact: string;
    country: number;  // Here, it should be a number (country ID)
    //country: Country;  // Still keeping as a Country object for internal use
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