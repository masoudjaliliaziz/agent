import * as React from "react";
import CartCard from "./CartCard";

export default class CartList extends React.Component<any, any> {
  render() {
    const { products, onDelete, discount, saveSignal } = this.props;

    return (
      <div>
        {products.map((product) => (
          <CartCard
            key={product.Id}
            product={product}
            onDelete={onDelete}
            discount={discount}
            saveSignal={saveSignal}
          />
        ))}
      </div>
    );
  }
}
