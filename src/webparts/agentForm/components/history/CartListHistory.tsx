import * as React from "react";
import CartCardHistory from "./CartCardHistory";

export default class CartListHistory extends React.Component<any, any> {
  render() {
    const { products, discount } = this.props;

    return (
      <div>
        {products.map((product) => (
          <CartCardHistory
            key={product.Id}
            product={product}
            discount={discount}
          />
        ))}
      </div>
    );
  }
}
