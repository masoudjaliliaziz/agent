import * as React from "react";
import styles from "./Cart.module.scss";
import Counter from "./Counter";
import { loadItemByCode, loadReservedInventoryByCode } from "../Crud/GetData";
import { handleUpdateCartPrice } from "../Crud/UpdateData";
import { addOrUpdateItemInVirtualInventory } from "../Crud/AddData";
import { addOrUpdateItemInOrderableInventory } from "../Crud/AddData"; // اضافه شده
import ReserveHistory from "../reserve/ReserveHistory";

export default class CartCard extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      productFromStore: {},
      count: 1,
      price: 0,
      total: 0,
      unit: 0,
      reserveInventory: "0",
      showSuccessPopup: false,
      reservedTotal: 0,
      errorMsg: "",
      inventoryAvailable: 0, // مقدار ذخیره شده برای مقایسه تغییرات
    };
  }

  async componentDidMount() {
    const { product } = this.props;
    const { codegoods, count, Title } = product;

    const unit = this.extractQuantity(Title);
    this.setState({ unit: Number(unit) });
    const productFromStore = await loadItemByCode(codegoods);
    const initialPrice = parseFloat(product.price);

    const reserveInventories = await loadReservedInventoryByCode(
      productFromStore.Code
    );
    const totalReserved = reserveInventories.reduce((acc, item) => {
      const resInv = parseInt(item.reserveInventory) || 0;
      return acc + resInv;
    }, 0);

    const inventory = parseInt(productFromStore.Inventory || "0");
    const inventoryAvailable = inventory - totalReserved;

    this.setState(
      {
        productFromStore,
        price: initialPrice,
        count: parseFloat(count) || 1,
        reservedTotal: totalReserved,
        inventoryAvailable, // مقدار اولیه ذخیره شود
      },
      () => {
        this.calculateTotal();
      }
    );
  }

  async componentDidUpdate(prevProps, prevState) {
    // وقتی محصول تغییر کرد، دوباره اطلاعات لود کن
    if (this.props.product.Id !== prevProps.product.Id) {
      const productFromStore = await loadItemByCode(
        this.props.product.codegoods
      );
      const initialPrice = parseFloat(this.props.product.price);

      const reserveInventories = await loadReservedInventoryByCode(
        productFromStore.Code
      );
      const totalReserved = reserveInventories.reduce((acc, item) => {
        const resInv = parseInt(item.reserveInventory) || 0;
        return acc + resInv;
      }, 0);

      const inventory = parseInt(productFromStore.Inventory || "0");
      const inventoryAvailable = inventory - totalReserved;

      this.setState(
        {
          productFromStore,
          price: initialPrice,
          count: parseFloat(this.props.product.count) || 1,
          reservedTotal: totalReserved,
          inventoryAvailable,
        },
        () => {
          this.calculateTotal();
        }
      );
    }

    // وقتی تعداد تغییر کرد، موجودی رزرو شده آپدیت شود
    if (this.state.count !== prevState.count) {
      await this.fetchReservedTotal(this.state.productFromStore.Code);
    }

    // وقتی موجودی رزرو شده یا موجودی کلی تغییر کرد، موجودی قابل رزرو (inventoryAvailable) را آپدیت کن
    if (
      this.state.reservedTotal !== prevState.reservedTotal ||
      this.state.productFromStore.Inventory !==
        prevState.productFromStore.Inventory
    ) {
      const inventory = parseInt(this.state.productFromStore.Inventory || "0");
      const inventoryAvailable = inventory - this.state.reservedTotal;

      // فقط اگر مقدار موجودی قابل رزرو تغییر کرده باشد، state را آپدیت کن و تابع addOrUpdate را صدا بزن
      if (inventoryAvailable !== this.state.inventoryAvailable) {
        this.setState({ inventoryAvailable }, async () => {
          try {
            await addOrUpdateItemInOrderableInventory({
              Code: this.state.productFromStore.Code,
              orderableInventory: String(this.state.inventoryAvailable),
            });
          } catch (err) {
            console.error("❌ خطا در ارسال موجودی قابل رزرو به سرور:", err);
          }
        });
      }
    }

    if (
      this.props.saveSignal &&
      this.props.saveSignal !== prevProps.saveSignal
    ) {
      this.handleSaveDiscountExternally();
    }
  }

  fetchReservedTotal = async (productCode) => {
    if (!productCode) return;

    try {
      const reserveInventories = await loadReservedInventoryByCode(productCode);

      const totalReserved = reserveInventories.reduce((acc, item) => {
        const resInv = parseInt(item.reserveInventory) || 0;
        return acc + resInv;
      }, 0);

      this.setState({ reservedTotal: totalReserved });
    } catch (err) {
      console.error("Error fetching reserved total:", err);
    }
  };

  extractQuantity(text) {
    // تبدیل اعداد فارسی به انگلیسی
    const persianNumbers = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
    persianNumbers.forEach((num, index) => {
      const regex = new RegExp(num, "g");
      text = text.replace(regex, index);
    });

    // گرفتن عدد قبل از "متری" یا "متري"
    const match = text.match(/(\d+)\s*(?:متر[یي])/);

    if (match) {
      return parseInt(match[1], 10); // فقط عدد
    } else {
      return null;
    }
  }

  handleUpdateInventory = async () => {
    const { product } = this.props;
    const { codegoods, guid_form, Title } = product;
    const { count, reservedTotal, productFromStore } = this.state;

    const inventory = parseInt(productFromStore.Inventory || "0");
    const inventoryAvailable = inventory - reservedTotal;

    if (count > inventoryAvailable) {
      this.setState({
        errorMsg: `موجودی کافی نیست! فقط ${inventoryAvailable} عدد می‌توانید رزرو کنید.`,
      });
      return;
    }

    this.setState({ errorMsg: "" });

    const reserveInventory = await addOrUpdateItemInVirtualInventory({
      guid_form,
      Title,
      ProductCode: String(codegoods),
      status: 0,
      reserveInventory: String(Number(count) * Number(this.state.unit)),
    });
    this.setState({ reserveInventory });

    await this.fetchReservedTotal(productFromStore.Code);
  };

  handleCountChange = (newCount: number) => {
    this.setState({ count: newCount }, () => {
      this.calculateTotal();
      this.props.onItemUpdate(this.props.product.Id, {
        count: newCount,
      });
    });
  };

  handleSaveDiscountExternally = async () => {
    const { discount, product } = this.props;
    const { price } = this.state;

    const discountAmount = ((price * discount) / 100).toFixed(2);
    const priceAfterDiscount = (price - parseFloat(discountAmount)).toFixed(2);

    const data = {
      price: price.toFixed(2),
      discountPersenTage: discount.toString(),
      discountAmount,
      priceAfterDiscount,
    };

    try {
      await handleUpdateCartPrice(product.Id, data);
    } catch (err) {
      console.error("❌ Error saving discount:", err);
    }
  };

  calculateTotal = () => {
    const { price, count, unit } = this.state;
    const { discount } = this.props;

    const discountedPrice = price - (price * discount) / 100;
    const total = discountedPrice * count * unit;

    this.setState({ total });
  };
  formatNumberWithComma = (number: number) => {
    return new Intl.NumberFormat().format(Number(number.toFixed(2)));
  };

  handleReservedTotalChange = (reservedTotal: number) => {
    this.setState({ reservedTotal });
  };

  render() {
    const { product, onDelete, discount } = this.props;
    const {
      productFromStore,
      price,
      total,
      showSuccessPopup,
      reserveInventory,
      errorMsg,
      reservedTotal,
      inventoryAvailable,
    } = this.state;

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
          <div className={styles.actionContainer}>
            <div
              onClick={() => onDelete(product.Id)}
              className={styles.deleteBtn}
            >
              حذف
            </div>
          </div>
        </div>

        <div className={styles.cardDescription}>
          <div className={styles.priceForm}>
            <input
              disabled
              className={styles.priceInput}
              type="number"
              value={price}
            />
            <div>قیمت</div>
          </div>
          <div className={styles.actionssContainer}>
            <Counter
              unit={product}
              Id={product.Id}
              onDelete={onDelete}
              onCountChange={this.handleCountChange}
            />
            <div
              onClick={() => this.handleUpdateInventory()}
              className={styles.reserveBtn}
            >
              رزرو
            </div>
          </div>
        </div>

        <div className={styles.cardDescription}>
          <div className={styles.discountDiv}>
            <p
              className={styles.inventoryDescription}
              style={{ color: "green" }}
            >
              موجودی قابل رزرو : {inventoryAvailable}
            </p>
            <p className={styles.inventoryReserve}>
              مجموع رزرو شده : {reservedTotal}
            </p>

            {errorMsg && (
              <p style={{ color: "red", fontWeight: "bold" }}>{errorMsg}</p>
            )}

            <p className={styles.inventoryDescription}>
              موجودی رزرو : {reserveInventory}
            </p>

            <div
              onClick={() => this.setState({ showSuccessPopup: true })}
              className={styles.reserve}
            >
              نمایش موجودی رزرو{" "}
            </div>
            <p>
              <small>تخفیف ({discount}٪):</small>{" "}
              {this.formatNumberWithComma(Math.ceil(discountAmount))} ریال
            </p>
            <p style={{ color: "green" }}>
              <small>قیمت بعد تخفیف (هر عدد):</small>{" "}
              {this.formatNumberWithComma(Math.ceil(finalPricePerItem))} ریال
            </p>
          </div>

          <div className={styles.priceForm}>
            <div className={styles.priceFormDivToatal}>
              {this.formatNumberWithComma(Math.ceil(total))}
            </div>
            <div className={styles.priceFormDivLabl}>جمع کل بدون تخفیف</div>
          </div>
        </div>
        {showSuccessPopup && (
          <div className={styles.popupOverlay}>
            <div className={styles.popupBox}>
              <ReserveHistory
                productCode={productFromStore.Code}
                onReservedTotalChange={this.handleReservedTotalChange}
              />
              <button
                className={styles.closePopupBtn}
                onClick={() => {
                  this.setState({ showSuccessPopup: false });
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
