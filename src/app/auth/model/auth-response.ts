export interface AuthResponse {
    access_token: string;
    refresh_token: string;
    message: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
    companies: string[];
    defaultCompany?: string; //field is optional
    companyIds?: number[];
    username: string;
    
  }
