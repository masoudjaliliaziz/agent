import * as React from "react";
import { Component } from "react";
import styles from "./Cart.module.scss";
import { loadCard } from "../Crud/GetData";
import CartList from "./CartList";

export default class Cart extends Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      cartItems: [],
      message: "",
      guid: "",
      discount: 0,
      showMessage: false,
    };
  }

  componentDidMount() {
    const hash = window.location.hash;
    if (hash) {
      const hashParams = new URLSearchParams(hash.replace("#/?", ""));
      const guid = hashParams.get("guid");
      if (guid) {
        localStorage.setItem("agent_guid", guid);
        this.setState({ guid }, () => this.loadCartItems(guid));
        return;
      }
    }

    const guidFromStorage = localStorage.getItem("agent_guid");
    if (guidFromStorage) {
      this.setState({ guid: guidFromStorage }, () =>
        this.loadCartItems(guidFromStorage)
      );
    }
  }

  loadCartItems = (guid: string) => {
    loadCard(guid).then((cartItems) => {
      this.setState({ cartItems });
    });
  };

  handleDeleteItem = (id: number) => {
    const listName = "shoping";
    const webUrl = "https://crm.zarsim.com";

    fetch(`${webUrl}/_api/contextinfo`, {
      method: "POST",
      headers: { Accept: "application/json;odata=verbose" },
    })
      .then((res) => res.json())
      .then((data) => data.d.GetContextWebInformation.FormDigestValue)
      .then((digest) =>
        fetch(
          `${webUrl}/_api/web/lists/getbytitle('${listName}')/items(${id})`,
          {
            method: "POST",
            headers: {
              Accept: "application/json;odata=verbose",
              "X-RequestDigest": digest,
              "IF-MATCH": "*",
              "X-HTTP-Method": "DELETE",
            },
          }
        )
      )
      .then(() => {
        this.setState({ message: "کالا حذف شد", showMessage: true });
        setTimeout(() => this.setState({ showMessage: false }), 2000);
        return loadCard(this.state.guid);
      })
      .then((cartItems) => {
        this.setState({ cartItems });
      });
  };

  handleDiscountChange = (e) => {
    const discount = parseFloat(e.target.value) || 0;
    this.setState({ discount });
  };

  handleSaveAllDiscounts = () => {
    this.setState({ saveSignal: Date.now() }); // تغییر ساده برای تریگر
  };

  calculateTotal = () => {
    return this.state.cartItems.reduce((sum, item) => {
      const count = parseFloat(item.count) || 0;
      const price = parseFloat(item.price) || 0;
      return sum + count * price;
    }, 0);
  };

  calculateDiscountAmount = () => {
    return (this.calculateTotal() * this.state.discount) / 100;
  };

  calculateTotalAfterDiscount = () => {
    return this.calculateTotal() - this.calculateDiscountAmount();
  };

  formatNumberWithComma = (number: number) => {
    return new Intl.NumberFormat().format(Number(number.toFixed(2)));
  };

  render() {
    const total = this.calculateTotal();
    const discountAmount = this.calculateDiscountAmount();
    const finalTotal = this.calculateTotalAfterDiscount();

    return (
      <div className={styles.formContainer}>
        {this.state.showMessage && (
          <div className={styles.errorMessage}>
            <span>{this.state.message}</span>
          </div>
        )}

        <CartList
          products={this.state.cartItems}
          onDelete={this.handleDeleteItem}
          discount={this.state.discount}
          saveSignal={this.state.saveSignal}
        />

        <div className={styles.totalContainer}>
          <div className={styles.row}>
            <div>
              <label> (%) تخفیف</label>
              <input
                type="number"
                value={this.state.discount}
                onChange={this.handleDiscountChange}
              />
            </div>
            <div>
              <small> مقدار تخفیف </small>
              <h3>
                {this.formatNumberWithComma(discountAmount)} <small>تومان</small>
              </h3>
            </div>
          </div>

          <div className={styles.row}>
            <div>
              <small> جمع کل بدون تخفیف </small>
              <h3>
                {this.formatNumberWithComma(total)} <small>تومان</small>
              </h3>
            </div>
            <div>
              <small> مبلغ نهایی</small>
              <h2>
                {this.formatNumberWithComma(finalTotal)} <small>تومان</small>
              </h2>
            </div>
          </div>

          <button onClick={this.handleSaveAllDiscounts}>ثبت تخفیف‌ها</button>
        </div>
      </div>
    );
  }
}
