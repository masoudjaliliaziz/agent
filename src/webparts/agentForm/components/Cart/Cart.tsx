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
      total: 0,
      discount: 0,
      showMessage: false,
    };
  }

  componentDidMount() {
    let guidFromUrl = "";
    const hash = window.location.hash;

    if (hash) {
      const hashParams = new URLSearchParams(hash.replace("#/?", ""));
      const guid = hashParams.get("guid");

      if (guid) {
        guidFromUrl = guid;
        localStorage.setItem("agent_guid", guid);
        this.setState({ parent_GUID: guid, guid }, () => {
          loadCard(guid).then((cartItems) => this.setState({ cartItems }));
        });
        return;
      }
    }

    const guidFromStorage = localStorage.getItem("agent_guid");
    if (guidFromStorage) {
      this.setState(
        { parent_GUID: guidFromStorage, guid: guidFromStorage },
        () => {
          loadCard(guidFromStorage).then((cartItems) =>
            this.setState({ cartItems })
          );
        }
      );
    }
  }

  formatNumberWithComma = (number: number) => {
    return new Intl.NumberFormat().format(number);
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
      .then((cartItems) => this.setState({ cartItems }))
      .catch((err) => this.setState({ message: `خطا: ${err.message}` }));
  };

  handleTotalUpdate = (total: number) => {
    this.setState((prev) => ({
      total: prev.total + total,
    }));
  };

  handleDiscountChange = (e) => {
    const discount = parseFloat(e.target.value) || 0;
    this.setState({ discount });
  };

  calculateDiscountAmount = () => {
    return (this.state.total * this.state.discount) / 100;
  };

  calculateTotalAfterDiscount = () => {
    return this.state.total - this.calculateDiscountAmount();
  };

  render() {
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
          onTotalUpdate={this.handleTotalUpdate}
          discount={this.state.discount}
        />

        <div className={styles.totalContainer}>
          <div className={styles.row}>
            {" "}
            <div>
              <label> (%) تخفیف</label>
              <input
                type="number"
                value={this.state.discount}
                onChange={this.handleDiscountChange}
              />
            </div>
            <div>
              {" "}
              <small> مقدار تخفیف </small>
              <h3>
                {" "}
                {this.formatNumberWithComma(Number(discountAmount.toFixed(2)))}
                <small> تومان</small>
              </h3>
            </div>
          </div>
          <div className={styles.row}>
            {" "}
            <div>
              {" "}
              <small> جمع کل بدون تخفیف </small>
              <h3>
                {" "}
                {this.formatNumberWithComma(this.state.total.toFixed(2))}
                <small> تومان</small>
              </h3>
            </div>
            <div>
              {" "}
              <small> مبلغ نهایی</small>
              <h2>
                {" "}
                {this.formatNumberWithComma(Number(finalTotal.toFixed(2)))}
                <small> تومان</small>
              </h2>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
