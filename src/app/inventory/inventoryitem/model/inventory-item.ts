import { Itemcategory } from "../../itemcategory/model/itemcategory";

export interface InventoryItem {

    id?: number;
    name: string;
    description: string;
    quantity: number;
    price: number;
    totalPrice?: number;
    itemCategoryId?: number;
    itemCategory?: Itemcategory
}
