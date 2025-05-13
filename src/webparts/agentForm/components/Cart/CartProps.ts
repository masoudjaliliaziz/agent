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
}

export interface CrudItemProps {
  product: Product;
  // onEdit: (id: number, title: string) => void;
  onDelete: (id: number) => void;
}
export interface CrudListProps {
  products: Product[];
  // onEdit: (id: number, title: string) => void;
  onDelete: (id: number) => void;
}
