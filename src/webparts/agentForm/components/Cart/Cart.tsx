import * as React from "react";
import { Component } from "react";
import styles from "./Cart.module.scss";
import { hashHistory } from "react-router";
import { loadCard } from "../Crud/GetData";
import CartList from "./CartList";

export default class Cart extends Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      cartItems: [],
      message: "",
      guid: "",
    };

    this.handleDeleteItem = this.handleDeleteItem.bind(this);
  }

  async componentDidMount() {
    // ابتدا مقدار GUID را از localStorage می‌گیریم
    // const guid = localStorage.getItem("userGuid");
    const guid = "0f492e61-c4a0-4177-8bd8-2a4bd46e5f9f";
    if (guid) {
      // سپس داده‌ها را با GUID فیلتر شده دریافت می‌کنیم
      const cartItems = await loadCard(guid);

      // در نهایت وضعیت را به روز می‌کنیم
      this.setState({ cartItems, guid });
    } else {
      this.setState({ message: "مقدار GUID پیدا نشد." });
    }
  }

  getDigest(): Promise<string> {
    const webUrl = "https://crm.zarsim.com";
    return fetch(`${webUrl}/_api/contextinfo`, {
      method: "POST",
      headers: { Accept: "application/json;odata=verbose" },
    })
      .then((res) => res.json())
      .then((data) => data.d.GetContextWebInformation.FormDigestValue);
  }

  handleDeleteItem(id: number) {
    const listName = "shoping";
    const webUrl = "https://crm.zarsim.com";

    this.getDigest()
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
        this.setState(
          (prev) => ({
            message: `کالای مورد نظر با موفقیت حذف شد`,
            refresh: prev.refresh + 1,
            showMessage: true,
          }),
          () => {
            setTimeout(() => {
              this.setState({ showMessage: false });
            }, 2000);
          }
        );
        return loadCard(this.state.guid); // بارگذاری دوباره کارت‌ها پس از حذف
      })
      .then((cartItems) => this.setState({ cartItems }))
      .catch((err) => this.setState({ message: `خطا در حذف: ${err.message}` }));
  }

  render() {
    return (
      <div className={styles.formContainer}>
        {this.state.showMessage && (
          <div className={styles.errorMessage}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6L9 17L4 12" />
            </svg>
            <span>{this.state.message}</span>
            <button
              className={styles.closeBtn}
              onClick={() => this.setState({ showMessage: false })}
            >
              ✕
            </button>
          </div>
        )}

        <CartList
          products={this.state.cartItems}
          onDelete={this.handleDeleteItem}
        />
      </div>
    );
  }
}
