export interface Country {
   id: number;
   name: string;
   code: string;
   continent: string;
 }
 
 export interface CountryPage {
   content: Country[];
   pageable: any;
   totalElements: number;
   totalPages: number;
   number: number;
   size: number;
 }
 