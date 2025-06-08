import * as React from "react";
import { Component } from "react";
import { loadAllOrders, loadCard } from "../Crud/GetData";
import styles from "./HistoryCart.module.scss";
import CartListHistory from "./CartListHistory";

export default class Cart extends Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      cartItems: [],
      guid: "",
      discount: 0,
      totalBeforeDiscount: 0,
      discountAmount: 0,
      totalAfterDiscount: 0,
      message: "",
      showMessage: false,
    };
  }

  componentDidMount() {
    if (this.props.guid) {
      this.setState({ guid: this.props.guid }, () => {
        this.loadAllData(this.state.guid);
      });
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.guid !== this.props.guid) {
      this.setState({ guid: this.props.guid }, () => {
        this.loadAllData(this.state.guid);
      });
    }
  }

  loadAllData = async (guid: string) => {
    try {
      const cartItems = await loadCard(guid);
      const orderDetails = await loadAllOrders(guid);
      const discountPercentage = Number(orderDetails.discountPercenTage) || 0;
      const totalBeforeDiscount =
        Number(
          orderDetails.totalPriceBeforeDiscount ||
            orderDetails.toatalPriceBeforeDiscount
        ) || 0;
      const discountAmount = Number(orderDetails.discountAmount) || 0;
      const totalAfterDiscount =
        Number(
          orderDetails.totalPriceAfterDiscount ||
            orderDetails.toatalPriceAfterDiscount
        ) || 0;

      this.setState({
        cartItems,
        discount: discountPercentage,
        totalBeforeDiscount,
        discountAmount,
        totalAfterDiscount,
        message: "",
        showMessage: false,
      });
    } catch (err) {
      console.error("Error loading cart or order details:", err);
      this.setState({ message: "خطا در دریافت اطلاعات.", showMessage: true });
    }
  };

  formatNumberWithComma = (number: number) =>
    new Intl.NumberFormat().format(Number(number.toFixed(2)));

  render() {
    const {
      cartItems,
      discount,
      totalBeforeDiscount,
      discountAmount,
      totalAfterDiscount,
      message,
      showMessage,
    } = this.state;

    return (
      <div className={styles.formContainer}>
        {showMessage && (
          <div className={styles.errorMessage}>
            <span>{message}</span>
          </div>
        )}

        <CartListHistory products={cartItems} discount={discount} />

        <div className={styles.totalContainer}>
          <div className={styles.row}>
            <div>
              <small className={styles.totalContainerSmall}>تخفیف (%)</small>
              <h3 className={styles.totalContainerH3}>
                {discount.toFixed(2)}%
              </h3>
            </div>
            <div>
              <small className={styles.totalContainerSmall}>مقدار تخفیف</small>
              <h3 className={styles.totalContainerH3}>
                {this.formatNumberWithComma(discountAmount)}
                <small className={styles.totalContainerH3Small}>تومان</small>
              </h3>
            </div>
          </div>

          <div className={styles.row}>
            <div>
              <small className={styles.totalContainerSmall}>
                جمع کل بدون تخفیف
              </small>
              <h3 className={styles.totalContainerH3}>
                {this.formatNumberWithComma(totalBeforeDiscount)}{" "}
                <small className={styles.totalContainerH3Small}>تومان</small>
              </h3>
            </div>
            <div>
              <small className={styles.totalContainerSmall}>مبلغ نهایی</small>
              <h2 className={styles.totalContainerH2}>
                {this.formatNumberWithComma(totalAfterDiscount)}{" "}
                <small className={styles.totalContainerH2Small}>تومان</small>
              </h2>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
