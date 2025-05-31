import * as React from "react";
import { Product, ShopPopUpProps } from "../IAgentFormProps";
import styles from "./Shop.module.scss";
import SearchBar from "../Search/SearchBar";
import { addToCart } from "../Crud/AddData";

export default class ShopPopUp extends React.Component<any, any> {
  constructor(props: ShopPopUpProps) {
    super(props);
    this.state = {
      searchQuery: "",
      showMessage: false,
    };
  }

  handleSearchChange = (e: any) => {
    this.setState({ searchQuery: e.target.value });
  };

  handleAddItem = async (item: Product) => {
    await addToCart(item);

    if (this.props.onItemAdded) {
      this.props.onItemAdded();
    }

    this.setState({ showMessage: true });

    setTimeout(() => {
      this.setState({ showMessage: false });
    }, 3000);
  };

  render() {
    const { products } = this.props;
    const { searchQuery, showMessage } = this.state;

    const filteredItems = searchQuery.trim()
      ? products.filter(
          (item) =>
            (item.Title && item.Title.includes(searchQuery)) ||
            (item.Code && item.Code.includes(searchQuery))
        )
      : products;

    return (
      <div className={styles.shopPopupDiv}>
        <div className={styles.shopPopupHeader}>
          <h2 className={styles.shopPopupHeading}>لیست محصولات</h2>
          <SearchBar value={searchQuery} onChange={this.handleSearchChange} />
        </div>

        <ul className={styles.shopPopupUL}>
          {filteredItems.map((p) => (
            <li className={styles.shopPopupItem} key={p.Code}>
              <span className={styles.shopPopupIndex}>{p.Code}</span>
              {p.Title}
              <button
                onClick={() => this.handleAddItem(p)}
                className={styles.shopPopupAddButton}
              >
                افزودن به سبد خرید
              </button>
            </li>
          ))}
        </ul>

        {showMessage && (
          <div className={styles.successMessage}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="green"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6L9 17L4 12" />
            </svg>
            <span>کالا با موفقیت به سبد خرید اضافه شد</span>
            <button
              className={styles.closeBtn}
              onClick={() => this.setState({ showMessage: false })}
            >
              ✕
            </button>
          </div>
        )}
      </div>
    );
  }
}
