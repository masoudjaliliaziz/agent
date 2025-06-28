import * as React from "react";
import { Component } from "react";
import { loadCard, loadItems, loadPhoneNumberFromOrder } from "../Crud/GetData";
import styles from "./Cart.module.scss";
import CartList from "./CartList";
import { updateOrderFormByGuid } from "../Crud/AddData";
import ShopPopUp from "../Shop/Shop";
import * as moment from "moment-jalaali";

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
      savedDiscount: 0,
      savedTotalBefore: 0,
      savedFinalTotal: 0,
      manualDiscountAmount: 0,
      savedDate: "",
      savedEditor: "",
      savedDiscountAmount: "",
      manualDiscount: "",
      products: [],
    };
  }

  componentDidMount() {
    this.setGuidFromUrlOrSession();

    loadItems().then((products) => this.setState({ products }));
    this.fetchSavedDiscountData(this.state.guid);
  }

  setGuidFromUrlOrSession = () => {
    const hash = window.location.hash;
    if (hash) {
      const hashParams = new URLSearchParams(hash.replace("#/?", ""));
      const guid = hashParams.get("guid");
      if (guid) {
        sessionStorage.setItem("agent_guid", guid);
        this.setState({ guid }, () => {
          this.loadCartItems(guid);
          this.fetchSavedDiscountData(guid); // اینجا صداش بزن
        });
        return;
      }
    }

    const guidFromSession = sessionStorage.getItem("agent_guid");
    if (guidFromSession) {
      this.setState({ guid: guidFromSession }, () => {
        this.loadCartItems(guidFromSession);
        this.fetchSavedDiscountData(guidFromSession); // اینجا صداش بزن
      });
    }
  };
  formatJalaliDate = (dateString) => {
    if (!dateString) return "";
    return moment(dateString).format("jYYYY/jMM/jDD - HH:mm");
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
  handleManualDiscountChange = (e) => {
    const manualDiscount = parseFloat(e.target.value) || 0;
    this.setState({ manualDiscount });
  };

  extractQuantity(text) {
    const persianNumbers = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
    persianNumbers.forEach((num, index) => {
      const regex = new RegExp(num, "g");
      text = text.replace(regex, index);
    });

    const match = text.match(/(\d+)\s*(?:متر[یي])/);

    if (match) {
      return parseInt(match[1], 10);
    } else {
      return null;
    }
  }

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
      Manual_Discount: String(this.state.manualDiscountAmount), // ارسال تخفیف دستی
    });
  };

  handleItemUpdate = (id: number, updatedFields: any) => {
    const updatedItems = this.state.cartItems.map((item) =>
      item.Id === id ? { ...item, ...updatedFields } : item
    );
    this.setState({ cartItems: updatedItems });
  };

  calculateTotal = () => {
    const totalBefore = this.calculateTotalBeforeDiscount();
    const discountAmount = this.calculateDiscountAmount();

    return totalBefore - discountAmount - this.state.manualDiscountAmount;
  };

  calculateDiscountAmount = () => {
    const totalBefore = this.calculateTotalBeforeDiscount();
    const discountAmount = totalBefore * (this.state.discount / 100); // فقط تخفیف درصدی

    return discountAmount;
  };

  calculateTotalBeforeDiscount = () => {
    return this.state.cartItems.reduce((sum, item) => {
      const count = parseFloat(item.count) || 0;
      const price = parseFloat(item.price) || 0;
      const unit = this.extractQuantity(item.Title) || 1;

      return sum + count * unit * price;
    }, 0);
  };

  formatNumberWithComma = (number: number) => {
    return new Intl.NumberFormat().format(Number(number.toFixed(2)));
  };

  fetchSavedDiscountData = (guid) => {
    if (!guid) {
      return;
    }

    fetch(
      `https://crm.zarsim.com/_api/web/lists/getbytitle('Orders')/items?$filter=guid_form eq '${guid}'`,
      {
        headers: { Accept: "application/json;odata=verbose" },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.d.results.length > 0) {
          const savedData = data.d.results[0];

          this.setState({
            savedDiscount: parseFloat(savedData.discountPercenTage) || 0,
            discount: parseFloat(savedData.discountPercenTage) || 0, // اضافه شود
            savedTotalBefore:
              parseFloat(savedData.toatalPriceBeforeDiscount) || 0,
            savedFinalTotal:
              parseFloat(savedData.toatalPriceAfterDiscount) || 0,
            savedDate: String(savedData.Created),
            savedEditor: String(savedData.Editor),
            savedDiscountAmount: String(savedData.discountAmount),
            manualDiscount: String(savedData.Manual_Discount),
            manualDiscountAmount: String(savedData.Manual_Discount),
          });
        }
      });
  };
  handleManualDiscountAmountChange = (e) => {
    const manualDiscountAmount = parseFloat(e.target.value) || 0;
    this.setState({ manualDiscountAmount });
  };

  render() {
    const totalBefore = this.calculateTotalBeforeDiscount();
    const discountAmount = this.calculateDiscountAmount(); // فقط درصدی
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
            <div className={styles.totalContainerDiv}>
              <label> (ریال) تخفیف دستی</label>
              <input
                className={styles.totalContainerInputRial}
                type="number"
                value={this.state.manualDiscountAmount}
                onChange={this.handleManualDiscountAmountChange}
              />
            </div>

            <div>
              <small className={styles.totalContainerSmall}>
                {" "}
                مقدار تخفیف{" "}
              </small>
              <div className={styles.priceShown}>
                <small className={styles.totalContainerH3Small}>ریال</small>
                <h3 className={styles.totalContainerH3}>
                  {this.formatNumberWithComma(Math.ceil(discountAmount))}
                </h3>
              </div>
            </div>
          </div>

          <div className={styles.row}>
            <div>
              <small className={styles.totalContainerSmall}>
                جمع کل بدون تخفیف
              </small>
              <div className={styles.priceShown}>
                <small className={styles.totalContainerH3Small}>ریال</small>
                <h3 className={styles.totalContainerH3}>
                  {this.formatNumberWithComma(totalBefore)}{" "}
                </h3>
              </div>
            </div>
            <div>
              <small className={styles.totalContainerSmall}> مبلغ نهایی</small>
              <div className={styles.priceShown}>
                <small className={styles.totalContainerH2Small}>ریال</small>
                <h2 className={styles.totalContainerH2}>
                  {this.formatNumberWithComma(Math.ceil(finalTotal))}{" "}
                </h2>
              </div>
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
          {this.state.savedTotalBefore > 0 && (
            <div className={styles.savedDataContainer}>
              <div className={styles.savedDataTitleContainer}>
                <h4 className={styles.savedDataContainerh4}>
                  مقادیر قبلی ثبت شده{" "}
                </h4>

                <small className={styles.savedDataContainerSmall}>در</small>
                <span className={styles.savedDataContainerSmall}>
                  {this.formatJalaliDate(this.state.savedDate)}
                </span>

                <small className={styles.savedDataContainerSmall}>توسط</small>
                <span className={styles.savedDataContainerSmall}>
                  {this.state.savedEditor}
                </span>
              </div>
              <p className={styles.savedDataContainerp}>
                <small className={styles.savedDataContainerSmall}>
                  {" "}
                  جمع کل بدون تخفیف
                </small>
                <span className={styles.savedDataContainerSpan}>
                  {this.formatNumberWithComma(this.state.savedTotalBefore)}
                </span>
                <small className={styles.savedDataContainerSmall}> ریال</small>
              </p>
              <p className={styles.savedDataContainerp}>
                <small className={styles.savedDataContainerSmall}>
                  مبلغ نهایی
                </small>
                <span className={styles.savedDataContainerSpan}>
                  {this.formatNumberWithComma(this.state.savedFinalTotal)}
                </span>
                <small className={styles.savedDataContainerSmall}> ریال</small>
              </p>
              <p className={styles.savedDataContainerp}>
                <small className={styles.savedDataContainerSmall}>تخفیف</small>
                <span className={styles.savedDataContainerSpan}>
                  {this.state.savedDiscount}{" "}
                </span>
                <small className={styles.savedDataContainerSmall}>%</small>
              </p>

              <p className={styles.savedDataContainerp}>
                <small className={styles.savedDataContainerSmall}>
                  مقدار تخفیف
                </small>
                <span className={styles.savedDataContainerSpan}>
                  {this.formatNumberWithComma(
                    Number(this.state.savedDiscountAmount)
                  )}{" "}
                </span>
                <small className={styles.savedDataContainerSmall}>ریال</small>
              </p>

              <p className={styles.savedDataContainerp}>
                <small className={styles.savedDataContainerSmall}>
                  مقدار تخفیف دستی
                </small>
                <span className={styles.savedDataContainerSpan}>
                  {this.formatNumberWithComma(
                    Number(this.state.manualDiscount)
                  )}{" "}
                </span>
                <small className={styles.savedDataContainerSmall}>ریال</small>
              </p>
            </div>
          )}
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
