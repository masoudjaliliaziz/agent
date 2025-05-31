export interface IAgentFormProps {
  description: string;
}

export interface IAgentFormState {
  parent_GUID: string;
}

export interface FormProps {
  parent_GUID: string;
}

export interface FormState {
  item_GUID: string;
  Event_Type: string;
  Order_Status: string;
}

export interface ShownFormProps {
  Event_Type: string;
  Order_Status: string;
  Description: string;
  Display_Name: string;
  Created: string;
  item_GUID: string;
  parent_GUID: string;
}

export interface SearchBarProps {
  value: string;
  onChange: (e: any) => void;
}

export interface ShopPopUpProps {
  products: Product[];
  onItemAdded?: () => void;
}

export interface ShopPopUpState {
  searchQuery: string;
  showMessage: boolean; 
}

export interface Product {
  codegoods: string;
  size: string;
  color: string;
  productgroup: string;
  IdCode: string;
  image: string;
  Id: number;
  Title: string;
  Code: string;
  djne: string;
  cart: (id: number, title: string) => void;
  updateCartCount?: () => void;
}
