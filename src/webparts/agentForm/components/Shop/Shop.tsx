import * as React from "react";
import { Product, ShopPopUpProps, ShopPopUpState } from "../IAgentFormProps";
import styles from "./Shop.module.scss";
import SearchBar from "../Search/SearchBar";
import { addToCart } from "../Crud/AddData";

export default class ShopPopUp extends React.Component<
  ShopPopUpProps,
  ShopPopUpState
> {
  constructor(props: ShopPopUpProps) {
    super(props);
    this.state = {
      searchQuery: "",
    };
  }

  private handleSearchChange = (e: any) => {
    this.setState({ searchQuery: e.target.value });
  };

  render() {
    const { products } = this.props;
    const { searchQuery } = this.state;

    const filteredItems = searchQuery.trim()
      ? products.filter(
          (item) => item.Title && item.Title.indexOf(searchQuery) !== -1
        )
      : products;

    return (
      <div className={styles.shopPopupDiv}>
        <div className={styles.shopPopupHeader}>
          <h2 className={styles.shopPopupHeading}>لیست محصولات</h2>
          <SearchBar value={searchQuery} onChange={this.handleSearchChange} />
        </div>

        <ul className={styles.shopPopupUL}>
          {filteredItems.map((p, index) => (
            <li className={styles.shopPopupItem} key={index}>
              <span className={styles.shopPopupIndex}>{index + 1}</span>
              {p.Title}
              <button
                onClick={() => addToCart(p)}
                className={styles.shopPopupAddButton}
              >
                افزودن به سبد خرید
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}
