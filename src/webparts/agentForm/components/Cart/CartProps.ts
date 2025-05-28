export interface Product {
  price: number;
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
}

export interface CrudItemProps {
  product: Product;
  onDelete: (id: number) => void;
  onTotalUpdate: (total: number) => void;
}

export interface CartListProps {
  products: any[];
  onDelete: (id: number) => void;
  onTotalUpdate: (total: number) => void;
  discount: number;
}
