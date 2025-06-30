import * as React from "react";
import { Component } from "react";
import styles from "./Form.module.scss";
import { FormProps } from "../IAgentFormProps";
import uuidv4 from "../utils/createGuid";
import { handleAddEvent, updatePreInvoiceCreateField } from "../Crud/AddData";
import { loadEvent, loadOrderByGuid, loadOrdersByGuid } from "../Crud/GetData";
import ShownForm from "./ShownForms";
import { FileUploader } from "../utils/FileUploader";

export default class Form extends Component<any, any> {
  private sendRef: FileUploader | null = null;
  private reciveRef: FileUploader | null = null;
  private intervalId = null;
  constructor(props: FormProps) {
    super(props);
    this.state = {
      item_GUID: "",
      Event_Type: "chose",
      Order_Status: "chose",
      Description: "",
      Events: [],
      economicalCode: "",
      phoneNumber: "",
      customerMobile: "",
      postalCode: "",
      address: "",
      customerNationalCode: "",
      coName: "",
      coFoundNumber: "",
      existLink: props.existLink,
    };

    this.onEventAdd = this.onEventAdd.bind(this);
    this.loadData = this.loadData.bind(this);
    this.checkPreInvoiceLink = this.checkPreInvoiceLink.bind(this);
  }

  componentDidMount() {
    setTimeout(async () => {
      if (this.props.parent_GUID) {
        this.loadData(this.props.parent_GUID);
        const orderData = await loadOrderByGuid(this.props.parent_GUID);
        const {
          phoneNumber,
          economicalCode,
          customerMobile,
          postalCode,
          address,
          customerNationalCode,
          coName,
          coFoundNumber,
        } = orderData;

        this.setState({
          phoneNumber,
          economicalCode,
          customerMobile,
          postalCode,
          address,
          customerNationalCode,
          coName,
          coFoundNumber,
        });
      }
    }, 2000);
    // شروع تایمر برای چک کردن لینک
    this.intervalId = setInterval(this.checkPreInvoiceLink, 2000);
  }

  componentWillUnmount() {
    // قطع تایمر موقع خروج از کامپوننت
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
  checkPreInvoiceLink = async () => {
    if (!this.props.parent_GUID) return;

    // داده رو از سرور بگیر
    const result = await loadOrdersByGuid(this.props.parent_GUID);

    // فرض می‌کنیم result یک آرایه است
    if (result && result.length > 0) {
      const currentOrderLink = result[0].link;

      if (currentOrderLink && currentOrderLink !== this.state.existLink) {
        this.setState({ existLink: currentOrderLink });

        if (this.intervalId) {
          clearInterval(this.intervalId);
          this.intervalId = null;
        }
      }
    }
  };

  async componentDidUpdate(prevProps: FormProps) {
    // اگه parent_GUID تغییر کرد، دیتا رو دوباره لود کن
    if (
      prevProps.parent_GUID !== this.props.parent_GUID &&
      this.props.parent_GUID
    ) {
      this.loadData(this.props.parent_GUID);
    }

    // اگه لینک تغییر کرد
    if (prevProps.existLink !== this.props.existLink) {
      this.setState({ existLink: this.props.existLink });

      // اگه لینک جدید خالی بود و تایمر فعال نیست، تایمر رو مجدد فعال کن
      if (
        (this.props.existLink === null ||
          this.props.existLink === "" ||
          this.props.existLink === undefined) &&
        this.intervalId === null
      ) {
        this.intervalId = setInterval(this.checkPreInvoiceLink, 2000);
      }
    }
  }

  async loadData(guid: string) {
    const EventsData = await loadEvent(guid);
    const newGUID = uuidv4();
    this.setState({
      Events: EventsData.reverse(),
      item_GUID: newGUID,
    });
  }

  async onEventAdd() {
    try {
      if (this.reciveRef) {
        await this.reciveRef.uploadFile();
      }
      if (this.sendRef) {
        await this.sendRef.uploadFile();
      }

      const { item_GUID, Event_Type, Order_Status, Description } = this.state;

      await handleAddEvent(
        item_GUID,
        this.props.parent_GUID,
        Event_Type,
        Order_Status,
        Description
      );

      await this.loadData(this.props.parent_GUID);

      this.setState({
        Event_Type: "chose",
        Order_Status: "chose",
        Description: "",
      });

      if (this.reciveRef) this.reciveRef.clearFile();
      if (this.sendRef) this.sendRef.clearFile();
    } catch (error) {
      console.error("خطا در ذخیره رویداد یا آپلود فایل:", error);
    }
  }

  async handleUpdatePreInvoiceCreateField() {
    const {
      economicalCode,
      phoneNumber,
      customerMobile,
      postalCode,
      address,
      customerNationalCode,
      coName,
      coFoundNumber,
    } = this.state;
    const data = {
      economicalCode,
      phoneNumber,
      customerMobile,
      postalCode,
      address,
      customerNationalCode,
      coName,
      coFoundNumber,
    };
    await updatePreInvoiceCreateField(this.props.parent_GUID, data);
    this.setState({
      economicalCode: "",
      phoneNumber: "",
      customerMobile: "",
      postalCode: "",
      address: "",
      customerNationalCode: "",
      coName: "",
      coFoundNumber: "",
      showSuccessPopup: false,
    });
  }

  render() {
    return (
      <div className={styles.Form}>
        {this.state.showSuccessPopup && (
          <div className={styles.popupOverlay}>
            <div className={styles.popupBox}>
              <div className={styles.popUpCloseContainer}>
                <span
                  onClick={() =>
                    this.setState({
                      showSuccessPopup: false,
                    })
                  }
                  className={styles.popUpClose}
                >
                  x
                </span>
              </div>

              <div className={styles.popupContent}>
                <div className={styles.popupForm}>
                  <label htmlFor="coNumber">نام شرکت</label>
                  <input
                    value={this.state.coName}
                    onChange={(e) =>
                      this.setState({ coName: e.currentTarget.value })
                    }
                    className={styles.popupFormInput}
                    type="text"
                    id="coNumber"
                  />
                  <label htmlFor="coFoundNumber"> شماره ثبت شرکت</label>
                  <input
                    value={this.state.coFoundNumber}
                    onChange={(e) =>
                      this.setState({ coFoundNumber: e.currentTarget.value })
                    }
                    className={styles.popupFormInput}
                    type="text"
                    id="coNumber"
                  />
                  <label htmlFor="nationalCode"> شناسه ملی</label>
                  <input
                    value={this.state.customerNationalCode}
                    onChange={(e) =>
                      this.setState({
                        customerNationalCode: e.currentTarget.value,
                      })
                    }
                    className={styles.popupFormInput}
                    type="text"
                    id="nationalCode"
                  />{" "}
                  <label htmlFor="postalCode"> کد پستی</label>
                  <input
                    value={this.state.postalCode}
                    onChange={(e) =>
                      this.setState({ postalCode: e.currentTarget.value })
                    }
                    className={styles.popupFormInput}
                    type="text"
                    id="postalCode"
                  />{" "}
                  <label htmlFor="ecoCode"> شماره اقتصادی</label>
                  <input
                    value={this.state.economicalCode}
                    onChange={(e) =>
                      this.setState({ economicalCode: e.currentTarget.value })
                    }
                    className={styles.popupFormInput}
                    type="text"
                    id="ecoCode"
                  />{" "}
                  <label htmlFor="address"> نشانی</label>
                  <textarea
                    value={this.state.address}
                    onChange={(e) =>
                      this.setState({ address: e.currentTarget.value })
                    }
                    className={styles.popupFormInput}
                    type="text"
                    id="address"
                  />{" "}
                  <label htmlFor="mobile"> تلفن همراه</label>
                  <input
                    value={this.state.phoneNumber}
                    onChange={(e) =>
                      this.setState({ phoneNumber: e.currentTarget.value })
                    }
                    className={styles.popupFormInput}
                    type="text"
                    id="mobile"
                  />{" "}
                  <label htmlFor="phoneNumber">تلفن ثابت </label>
                  <input
                    value={this.state.customerMobile}
                    onChange={(e) =>
                      this.setState({ customerMobile: e.currentTarget.value })
                    }
                    className={styles.popupFormInput}
                    type="text"
                    id="phoneNumber"
                  />
                </div>
              </div>

              <div
                className={styles.closePopupBtn}
                onClick={async () => {
                  await this.handleUpdatePreInvoiceCreateField();
                  this.props.onRefresh(); // 🔁 بعد از ذخیره، فرم رفرش بشه
                }}
              >
                ذخیره و ایجاد پیش فاکتور
              </div>
            </div>
          </div>
        )}

        <div className={styles.formContainer}>
          <div className={styles.upladContainer}>
            <FileUploader
              ref={(el) => (this.reciveRef = el)}
              orderNumber={this.props.parent_GUID}
              subFolder={this.state.item_GUID}
              title={"فایل دریافتی"}
            />
            <FileUploader
              ref={(el) => (this.sendRef = el)}
              orderNumber={this.props.parent_GUID}
              subFolder={this.state.item_GUID}
              title={"فایل ارسالی"}
            />
          </div>

          <div className={styles.distributerCodeDiv}>
            {this.props.distributerCode &&
              this.props.distributerCode.trim() !== "" && (
                <div className={styles.distributerCodeChildDiv}>
                  <p className={styles.distributerCodeParaph}>
                    کد نماینده:{" "}
                    <span className={styles.distributerCodeSpan}>
                      {this.props.distributerCode}
                    </span>
                  </p>
                </div>
              )}

            <div className={styles.selectContainer}>
              <select
                value={this.state.Event_Type}
                onChange={(event) =>
                  this.setState({
                    Event_Type: String(event.currentTarget.value),
                  })
                }
                name="Event_Type"
              >
                <option value="chose" disabled>
                  نوع رویداد
                </option>
                <option value="telegram">تلگرام</option>
                <option value="whatsapp">واتساپ</option>
                <option value="phoneNumber">تماس تلفنی</option>
                <option value="email">ایمیل</option>
                <option value="presental">حضوری</option>
              </select>

              <select
                value={this.state.Order_Status}
                onChange={(event) =>
                  this.setState({
                    Order_Status: String(event.currentTarget.value),
                  })
                }
                name="Order_Status"
              >
                <option value="chose" disabled>
                  وضعیت سفارش
                </option>
                <option value="درحال مذاکره">در حال مذاکره</option>
                <option value="ارجاع به کارشناس">ارجاع به کارشناس</option>
                <option value="نا موفق">ناموفق</option>
              </select>
            </div>
          </div>

          <textarea
            placeholder="توضیحات ..."
            value={this.state.Description}
            onChange={(e) =>
              this.setState({ Description: e.currentTarget.value })
            }
          />

          <div className={styles.buttonsContainer}>
            <div className={styles.buttonSave} onClick={this.onEventAdd}>
              ذخیره
            </div>

            <button
              type="button"
              className={styles.preInvoiceButton}
              onClick={() => {
                this.setState({ showSuccessPopup: true });
              }}
            >
              وارد کردن اطلاعات تکمیلی و ایجاد پیش فاکتور
            </button>

            {this.state.existLink === null ||
            this.state.existLink === "" ||
            this.state.existLink === undefined ? (
              <p>پیش فاکتوری یافت نشد</p>
            ) : (
              <a
                href={this.state.existLink}
                className={styles.preInvoiceButton}
                target="_blank"
                rel="noopener noreferrer"
              >
                مشاهده پیش فاکتور
              </a>
            )}
          </div>
        </div>

        <div className={styles.shownHistory}>
          {this.state.Events.map((event, i) => (
            <ShownForm
              key={i}
              Description={event.Description}
              Event_Type={event.Event_Type}
              Display_Name={event.Display_Name}
              Order_Status={event.Order_Status}
              Created={event.Created}
              parent_GUID={this.props.parent_GUID}
              item_GUID={event.Title}
            />
          ))}
        </div>
      </div>
    );
  }
}
