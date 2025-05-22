import * as React from "react";
import styles from "./Cart.module.scss";
import Counter from "./Counter";
import { loadItemByCode } from "../Crud/GetData";
import { handleUpdateCartPrice } from "../Crud/UpdateData";

export default class CartCard extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      productFromStore: {},
      count: 1,
      price: 0,
      total: 0,
    };
  }

  async componentDidMount() {
    const { product } = this.props;
    const { codegoods } = product;
    const productFromStore = await loadItemByCode(codegoods);
    const initialPrice = productFromStore.Price || product.price || 0;

    this.setState(
      {
        productFromStore,
        price: initialPrice,
      },
      this.calculateTotal
    );
  }

  componentDidUpdate(prevProps) {
    if (prevProps.discount !== this.props.discount) {
      this.calculateTotal();
    }
  }

  handleCountChange = (newCount: number) => {
    this.setState({ count: newCount }, this.calculateTotal);
  };

  handlePriceChange = (e) => {
    const price = parseFloat(e.target.value) || 0;
    this.setState({ price }, this.calculateTotal);
  };

  handlePriceBlur = async (e) => {
    const price = e.target.value;
    const { product } = this.props;
    await handleUpdateCartPrice(product.Id, price);
  };

  calculateTotal = () => {
    const { price, count } = this.state;
    const { discount } = this.props;
    const discountedPrice = price - (price * discount) / 100;
    const total = discountedPrice * count;
    this.setState({ total });

    this.props.onTotalUpdate(total);
  };

  render() {
    const { product, onDelete, discount } = this.props;
    const { productFromStore, price, total } = this.state;

    const discountAmount = (price * discount) / 100;
    const finalPricePerItem = price - discountAmount;

    return (
      <div className={styles.cardContainer}>
        <div className={styles.cardDescription}>
          <div className={styles.xs}>
            <p className={styles.codegoods}>
              <small>کد کالا:</small> {product.codegoods}
            </p>
            <p className={styles.titleDescription}>{product.Title}</p>
          </div>
          <button
          type="button"
            onClick={() => onDelete(product.Id)}
            className={styles.deleteBtn}
          >
            حذف
          </button>
        </div>

        <div className={styles.cardDescription}>
          <p className={styles.inventoryDescription}>
            <small>موجودی:</small> {productFromStore.Inventory}
          </p>
          <div className={styles.priceForm}>
            <input
              className={styles.priceInput}
              type="number"
              value={price}
              onBlur={this.handlePriceBlur}
              onChange={this.handlePriceChange}
            />
            <div>قیمت</div>
          </div>
          <Counter
            Id={product.Id}
            onDelete={onDelete}
            onCountChange={this.handleCountChange}
          />
        </div>
        <div className={styles.cardDescription}>
          <div className={styles.discountDiv}>
            <p>
              <small>تخفیف ({discount}٪):</small>{" "}
              {discountAmount.toFixed(2).toLocaleString()} تومان
            </p>
            <p style={{ color: "green" }}>
              <small>قیمت بعد تخفیف (هر عدد):</small>{" "}
              {finalPricePerItem.toFixed(2).toLocaleString()} تومان
            </p>
          </div>

          <div className={styles.priceForm}>
            <input type="number" disabled value={total.toFixed(2)} />
            <div type="submit">جمع</div>
          </div>
        </div>
      </div>
    );
  }
}
