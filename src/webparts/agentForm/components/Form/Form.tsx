import * as React from "react";
import { Component } from "react";
import styles from "./Form.module.scss";
import { FormProps, FormState } from "../IAgentFormProps";
import uuidv4 from "../utils/createGuid";
import { handleAddEvent } from "../Crud/AddData";

export default class Form extends Component<FormProps, any> {
  constructor(props: FormProps) {
    super(props);
    this.state = {
      item_GUID: "",
      Event_Type: "", // مقدار پیش‌فرض برای Event_Type
      Order_Status: "",
      Description: "",
    };
  }

  componentDidMount() {
    const item_GUID = uuidv4();
    this.setState({
      item_GUID,
      Event_Type: "chose", // مقدار پیش‌فرض انتخاب برای Event_Type
    });
  }

  onEventAdd() {
    handleAddEvent(
      this.state.item_GUID,
      this.props.parent_GUID,
      this.state.Event_Type,
      this.state.Order_Status,
      this.state.Description
    );
  }

  render() {
    return (
      <div className={styles.formContainer}>
        <div className={styles.selectContainer}>
          <button className={styles.reciveBtn}>فایل دریافتی</button>
          <button className={styles.sendBtn}>فایل ارسالی</button>
          <select
            value={this.state.Event_Type} // مقدار انتخاب‌شده بر اساس state
            onChange={(event) =>
              this.setState({
                Event_Type: String(event.currentTarget.value), // به‌روزرسانی مقدار Event_Type
              })
            }
            name="Event_Type"
          >
            <option value="chose" disabled>
              نوع رویداد
            </option>{" "}
            {/* گزینه پیش‌فرض */}
            <option value="telegram">تلگرام</option>
            <option value="whatsapp">واتساپ</option>
            <option value="phoneNumber">تماس تلفنی</option>
            <option value="email">ایمیل</option>
            <option value="presental">حضوری</option>
          </select>

          <select
            value={this.state.Order_Status} // مقدار انتخاب‌شده بر اساس state
            onChange={(event) =>
              this.setState({
                Order_Status: String(event.currentTarget.value), // به‌روزرسانی مقدار Event_Type
              })
            }
            name="Event_Type"
          >
            <option value="chose" disabled>
              وضعیت سفارش
            </option>{" "}
            {/* گزینه پیش‌فرض */}
            <option value="درحال مذاکره">در حال مذاکره</option>
            <option value="ارجاع به کارشناس">ارجاع به کارشناس</option>
            <option value="نا موفق"> ناموفق</option>
          </select>
        </div>
        <textarea
          placeholder="توضیحات ..."
          onChange={(e) =>
            this.setState({ Description: e.currentTarget.value })
          }
        />
        <button onClick={() => this.onEventAdd()}>ذخیره</button>
      </div>
    );
  }
}
