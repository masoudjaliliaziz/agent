import * as React from "react";
import { Product } from "../IAgentFormProps";
import styles from "./Shop.module.scss";
import SearchBar from "../Search/SearchBar";

export default class ShopPopUp extends React.Component<
  { products: Product[] },
  any
> {
  constructor(props) {
    super(props);
    this.state = {
      searchQuery: "",
    };
  }

  handleSearchChange = (e: any) => {
    this.setState({ searchQuery: e.target.value });
  };

  render() {
    const { products } = this.props;
    const { searchQuery } = this.state;

    let filteredItems = products;

    if (searchQuery.trim() !== "") {
      filteredItems = filteredItems.filter(
        (item: Product) => item.Title && item.Title.indexOf(searchQuery) !== -1
      );
    }

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
            </li>
          ))}
        </ul>
      </div>
    );
  }
}
