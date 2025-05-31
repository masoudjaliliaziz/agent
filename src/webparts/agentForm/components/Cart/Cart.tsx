import * as React from "react";
import { Component } from "react";
import { loadCard, loadItems } from "../Crud/GetData";
import styles from "./Cart.module.scss";
import CartList from "./CartList";
import { updateOrderFormByGuid } from "../Crud/AddData";
import ShopPopUp from "../Shop/Shop";

export default class Cart extends Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      cartItems: [],
      message: "",
      guid: "",
      discount: 0,
      showMessage: false,
      saveSignal: null,
      shopPopup: false,
    };
  }

  componentDidMount() {
    this.setGuidFromUrlOrSession();

    loadItems().then((products) => this.setState({ products: products }));
  }

  setGuidFromUrlOrSession = () => {
    const hash = window.location.hash;
    if (hash) {
      const hashParams = new URLSearchParams(hash.replace("#/?", ""));
      const guid = hashParams.get("guid");
      if (guid) {
        sessionStorage.setItem("agent_guid", guid);
        this.setState({ guid }, () => this.loadCartItems(guid));
        return;
      }
    }

    const guidFromSession = sessionStorage.getItem("agent_guid");
    if (guidFromSession) {
      this.setState({ guid: guidFromSession }, () =>
        this.loadCartItems(guidFromSession)
      );
    }
  };

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

  handleSaveAllDiscounts = async (
    finalTotal,
    totalBefore,
    discountAmount,
    discountPersenTage
  ) => {
    this.setState({ saveSignal: Date.now() });
    await updateOrderFormByGuid(sessionStorage.getItem("agent_guid"), {
      toatalPriceAfterDiscount: String(finalTotal),
      toatalPriceBeforeDiscount: String(totalBefore),
      discountAmount: String(discountAmount),
      discountPercenTage: String(discountPersenTage),
    });
  };

  handleItemUpdate = (id: number, updatedFields: any) => {
    const updatedItems = this.state.cartItems.map((item) =>
      item.Id === id ? { ...item, ...updatedFields } : item
    );
    this.setState({ cartItems: updatedItems });
  };

  calculateTotal = () => {
    return this.state.cartItems.reduce((sum, item) => {
      const count = parseFloat(item.count) || 0;
      const price = parseFloat(item.price) || 0;
      const discountedPrice = price - (price * this.state.discount) / 100;
      return sum + count * discountedPrice;
    }, 0);
  };

  calculateDiscountAmount = () => {
    return (
      (this.calculateTotal() * this.state.discount) /
      (100 + this.state.discount)
    );
  };

  calculateTotalBeforeDiscount = () => {
    return this.state.cartItems.reduce((sum, item) => {
      const count = parseFloat(item.count) || 0;
      const price = parseFloat(item.price) || 0;
      return sum + count * price;
    }, 0);
  };

  formatNumberWithComma = (number: number) => {
    return new Intl.NumberFormat().format(Number(number.toFixed(2)));
  };

  render() {
    const totalBefore = this.calculateTotalBeforeDiscount();
    const discountAmount = totalBefore - this.calculateTotal();
    const finalTotal = this.calculateTotal();

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
          onItemUpdate={this.handleItemUpdate}
        />

        <div className={styles.addProductDiv}>
          <button
            className={styles.addProductBtn}
            type="button"
            onClick={() => {
              this.setState({ shopPopup: true });
            }}
          >
            افزودن محصول
          </button>
        </div>

        <div className={styles.totalContainer}>
          <div className={styles.row}>
            <div className={styles.totalContainerDiv}>
              <label> (%) تخفیف</label>
              <input
                className={styles.totalContainerInput}
                type="number"
                value={this.state.discount}
                onChange={this.handleDiscountChange}
              />
            </div>

            <div>
              <small className={styles.totalContainerSmall}>
                {" "}
                مقدار تخفیف{" "}
              </small>
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
                {this.formatNumberWithComma(totalBefore)}{" "}
                <small className={styles.totalContainerH3Small}>تومان</small>
              </h3>
            </div>
            <div>
              <small className={styles.totalContainerSmall}> مبلغ نهایی</small>
              <h2 className={styles.totalContainerH2}>
                {this.formatNumberWithComma(finalTotal)}{" "}
                <small className={styles.totalContainerH2Small}>تومان</small>
              </h2>
            </div>
          </div>

          <div
            className={styles.submit}
            onClick={() =>
              this.handleSaveAllDiscounts(
                finalTotal,
                totalBefore,
                discountAmount,
                this.state.discount
              )
            }
          >
            ثبت
          </div>
        </div>

        {this.state.shopPopup && (
          <div>
            <div
              className={styles.shopPopupBackdrop}
              onClick={() => this.setState({ shopPopup: false })}
            />
            <div className={styles.shopPopupContainor}>
              <ShopPopUp
                products={this.state.products}
                onItemAdded={() => {
                  this.loadCartItems(this.state.guid);
                }}
              />

              <button
                className={styles.closeShopPopupBtn}
                onClick={() => {
                  this.setState({ shopPopup: false });
                }}
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
