import { Itemcategory } from "../../itemcategory/model/itemcategory";

export interface InventoryItem {

    id?: number;
    name: string;
    description: string;
    quantity: number;
    price: number;
    totalPrice?: number;
    itemCategoryId: number;
    itemCategory?: Itemcategory
}

export interface PaginatedResponse<T> {
    totalItems: number;
    size: number;
    totalPages: number;
    currentPage: number;
    items: T[];
  }
