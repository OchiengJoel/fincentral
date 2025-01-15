export interface Company {

    id: number;
    name: string;
}

export interface CompanyPage {
    content: Company[]; // Array of companies
    pageable: any; // Optional: You can define this more specifically if needed
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
    // Add other pagination properties as needed
  }
