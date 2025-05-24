import * as React from "react";
import CartCard from "./CartCard";

export default class CartList extends React.Component<any, any> {
  render() {
    const { products, onDelete, onUpdate, discount } = this.props;

    return (
      <div>
        {products.map((product) => (
          <CartCard
            key={product.Id}
            product={product}
            onDelete={onDelete}
            onUpdate={onUpdate}
            discount={discount}
          />
        ))}
      </div>
    );
  }
}