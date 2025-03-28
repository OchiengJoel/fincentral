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
    modules: ModulePermission[];
    
  }


  export interface ModulePermission {
    moduleId: string;
    moduleName: string;
    entities: EntityPermission[];
  }
  
  export interface EntityPermission {
    entityId: string;
    entityName: string;
    allowedActions: string[];
  }
