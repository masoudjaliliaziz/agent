import * as React from "react";
import styles from "./HistoryCart.module.scss";
import { loadItemByCode, loadReservedInventoryByCode } from "../Crud/GetData";
import ReserveHistory from "../reserve/ReserveHistory";

export default class CartCardHistory extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      productFromStore: null,
      reservedTotal: 0,
      showReservePopup: false,
      errorMsg: "",
    };
  }

  componentDidMount() {
    this.loadProduct();
  }

  loadProduct = async () => {
    const product = this.props.product;
    const productFromStore = await loadItemByCode(product.codegoods);
    this.setState({ productFromStore: productFromStore }, () => {
      if (productFromStore && productFromStore.Code) {
        this.fetchReservedTotal(productFromStore.Code);
      }
    });
  };

  fetchReservedTotal = async (productCode: string) => {
    if (!productCode) return;
    try {
      const reserveInventories = await loadReservedInventoryByCode(productCode);
      let totalReserved = 0;
      for (let i = 0; i < reserveInventories.length; i++) {
        const item = reserveInventories[i];
        totalReserved += item.reserveInventory ? item.reserveInventory * 1 : 0;
      }
      this.setState({ reservedTotal: totalReserved });
    } catch (err) {
      console.error("Error fetching reserved total:", err);
      this.setState({ errorMsg: "خطا در دریافت موجودی رزرو شده" });
    }
  };

  formatNumberWithComma = (number: number) =>
    new Intl.NumberFormat().format(Number(number.toFixed(2)));

  render() {
    const product = this.props.product;
    const discount = this.props.discount;
    const state = this.state;
    const productFromStore = state.productFromStore;
    const reservedTotal = state.reservedTotal;
    const showReservePopup = state.showReservePopup;
    const errorMsg = state.errorMsg;

    if (!productFromStore) return <div>در حال بارگذاری...</div>;

    let price = productFromStore.Price;
    if (price === undefined || price === null || price === "") {
      price = product.price;
      if (price === undefined || price === null || price === "") {
        price = "0";
      }
    }

    let count = product.count;
    if (count === undefined || count === null || count === "") {
      count = "1";
    }

    const discountAmount = (price * discount) / 100;
    const finalPrice = price - discountAmount;
    const total = finalPrice * count;

    return (
      <div className={styles.cardContainer}>
        <div className={styles.cardDescription}>
          <p className={styles.codegoods}>
            <small>کد کالا:</small> {product.codegoods}
          </p>
          <p className={styles.titleDescription}>{product.Title}</p>
        </div>

        <div className={styles.cardDescription}>
          <div className={styles.priceForm}>
            <input
              className={styles.priceInput}
              type="number"
              value={price}
              disabled
            />
            <div>قیمت</div>
          </div>
          <div>
            <p>تعداد: {count}</p>
          </div>
        </div>

        <div className={styles.cardDescription}>
          <div className={styles.discountDiv}>
            <p className={styles.inventoryReserve}>
              مجموع رزرو شده: {reservedTotal}
            </p>
            <div
              onClick={() => this.setState({ showReservePopup: true })}
              className={styles.reserve}
              style={{
                cursor: "pointer",
                color: "blue",
                textDecoration: "underline",
              }}
            >
              نمایش موجودی رزرو
            </div>
            <p>
              <small>تخفیف ({discount}٪):</small>{" "}
              {this.formatNumberWithComma(discountAmount)} تومان
            </p>
            <p style={{ color: "green" }}>
              <small>قیمت بعد تخفیف (هر عدد):</small>{" "}
              {this.formatNumberWithComma(finalPrice)} تومان
            </p>
          </div>

          <div className={styles.priceForm}>
            <input type="number" disabled value={total} />
            <div>جمع</div>
          </div>
          {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
        </div>

        {showReservePopup && (
          <div className={styles.popupOverlay}>
            <div className={styles.popupBox}>
              <ReserveHistory productCode={productFromStore.Code} />
              <button
                className={styles.closePopupBtn}
                onClick={() => this.setState({ showReservePopup: false })}
              >
                بستن
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
}
