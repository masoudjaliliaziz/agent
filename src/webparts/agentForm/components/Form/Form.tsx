import * as React from "react";
import { Component } from "react";
import styles from "./Form.module.scss";
import { FormProps, FormState } from "../IAgentFormProps";
import uuidv4 from "../utils/createGuid"; // برای تولید GUID
import { handleAddEvent } from "../Crud/AddData";
import { loadEvent } from "../Crud/GetData";
import ShownForm from "./ShownForms";

export default class Form extends Component<FormProps, any> {
  constructor(props: FormProps) {
    super(props);
    this.state = {
      item_GUID: "", // GUID که برای هر فرم جدید ایجاد می‌شود
      Event_Type: "", // مقدار پیش‌فرض برای Event_Type
      Order_Status: "",
      Description: "",
      Events: [],
    };
    console.log(this.props.parent_GUID);
  }

  async componentDidMount() {
    const parent_guid = await this.props.parent_GUID;
    console.log(parent_guid);
    const EventsData = await loadEvent(this.props.parent_GUID);
    console.log(EventsData);
    this.setState({
      Events: EventsData,
    });

    // تولید GUID جدید هنگام بارگذاری کامپوننت
  }

  // متد برای تولید GUID جدید
  generateNewGUID() {
    const item_GUID = uuidv4();
    this.setState({ item_GUID });
  }

  async onEventAdd() {
    await handleAddEvent(
      this.state.item_GUID,
      this.props.parent_GUID,
      this.state.Event_Type,
      this.state.Order_Status,
      this.state.Description
    );

    const updatedEvents = await loadEvent(this.props.parent_GUID);

    this.setState({
      Events: updatedEvents,
      item_GUID: "",
      Event_Type: "chose",
      Order_Status: "chose",
      Description: "",
    });

    this.generateNewGUID();
  }

  render() {
    return (
      <div className={styles.Form}>
        {" "}
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
                  Order_Status: String(event.currentTarget.value), // به‌روزرسانی مقدار Order_Status
                })
              }
              name="Order_Status"
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
            value={this.state.Description} // مقدار موجود در state
            onChange={(e) =>
              this.setState({ Description: e.currentTarget.value })
            }
          />
          <button onClick={() => this.onEventAdd()}>ذخیره</button>
        </div>
        {this.state.Events.map((event, i) => (
          <ShownForm
            Description={event.Description}
            Event_Type={event.Event_Type}
            Display_Name={event.Display_Name}
            Order_Status={event.Order_Status}
            Created={event.Created}
            key={i}
          />
        ))}
      </div>
    );
  }
}
