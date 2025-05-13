import * as React from "react";
import { CrudListProps } from "./CartProps";
import CartCard from "./CartCard";
import styles from "./Cart.module.scss";

export default class CartList extends React.Component<CrudListProps, any> {
  render() {
    const { products, onDelete } = this.props;

    return (
      <div className={styles.productsDiv}>
        {products.map((product) => (
          <CartCard product={product} key={product.Id} onDelete={onDelete} />
        ))}
      </div>
    );
  }
}
