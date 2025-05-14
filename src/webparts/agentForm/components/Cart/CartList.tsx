import * as React from "react";

import CartCard from "./CartCard";
import styles from "./Cart.module.scss";

export default class CartList extends React.Component<any, any> {
  render() {
    const { products, onDelete, onTotalUpdate, discount } = this.props;

    return (
      <div>
        {products.map((product) => (
          <CartCard
            key={product.Id}
            product={product}
            onDelete={onDelete}
            onTotalUpdate={onTotalUpdate}
            discount={discount}
          />
        ))}
      </div>
    );
  }
}
