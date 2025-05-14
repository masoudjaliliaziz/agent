import * as React from "react";
import { CrudItemProps } from "./CartProps";
import styles from "./Cart.module.scss";
import Counter from "./Counter";
import { getItemTypeForList, loadItemByCode } from "../Crud/GetData";
import { handleUpdateCartPrice } from "../Crud/UpdateData";
import { getDigest } from "../Crud/GetDigest";

export default class CartCard extends React.Component<CrudItemProps, any> {
  constructor(props) {
    super(props);
    this.state = {
      productFromStore: {},
      count: 1,
      price: 0,
      discount: 0,
      total: 0,
    };
  }

  async componentDidMount() {
    const { product } = this.props;
    const { codegoods } = product;
    const productFromStore = await loadItemByCode(codegoods);
    const initialPrice = productFromStore.Price || product.price || 0;

    // استفاده از این تابع برای دریافت نوع داده

    this.setState(
      {
        productFromStore,
        price: initialPrice,
      },
      this.calculateTotal
    );
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
    console.log(price);
    console.log(product.Id);

    await handleUpdateCartPrice(product.Id, price);
  };

  handleDiscountChange = (e) => {
    const discount = parseFloat(e.target.value) || 0;
    this.setState({ discount }, this.calculateTotal);
  };

  calculateTotal = () => {
    const { price, count, discount } = this.state;
    const discountedPrice = price - (price * discount) / 100;
    const total = discountedPrice * count;
    this.setState({ total });
  };

  render() {
    const { product, onDelete } = this.props;
    const { productFromStore, price, discount, total } = this.state;

    return (
      <div className={styles.cardContainer}>
        <div className={styles.cardDescription}>
          <div className={styles.xs}>
            <p className={styles.codegoods}>
              <small>کد کالا : </small> {product.codegoods}
            </p>
            <p className={styles.titleDescription}>
              <small> نام محصول : </small>
              {product.Title}
            </p>
          </div>
          <div className={styles.actionsContainer}>
            <button
              onClick={() => onDelete(product.Id)}
              className={styles.deleteBtn}
            >
              حذف
            </button>
          </div>
        </div>

        <div className={styles.cardDescription}>
          <p className={styles.inventoryDescription}>
            <small> موجودی : </small>
            {productFromStore.Inventory}
          </p>

          <Counter
            Id={product.Id}
            onDelete={onDelete}
            onCountChange={this.handleCountChange}
          />

          <form
            className={styles.priceForm}
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="number"
              value={price}
              onBlur={this.handlePriceBlur} // وقتی فوکوس از input خارج می‌شود
              onChange={this.handlePriceChange}
            />
            {/* نیازی به دکمه ارسال برای ثبت قیمت نیست */}
          </form>

          <form
            className={styles.fullPrice}
            onSubmit={(e) => e.preventDefault()}
          >
            <input type="number" disabled value={total.toFixed(2)} />
            <button type="submit">جمع</button>
          </form>
        </div>
      </div>
    );
  }
}
