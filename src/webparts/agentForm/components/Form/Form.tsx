import * as React from "react";
import { Component } from "react";
import styles from "./Form.module.scss";
import { FormProps } from "../IAgentFormProps";
import uuidv4 from "../utils/createGuid"; // برای تولید GUID
import { handleAddEvent } from "../Crud/AddData";
import { loadEvent } from "../Crud/GetData";
import ShownForm from "./ShownForms";
import { FileUploader } from "../utils/FileUploader";

export default class Form extends Component<FormProps, any> {
  constructor(props: FormProps) {
    super(props);
    this.state = {
      item_GUID: "",
      Event_Type: "chose",
      Order_Status: "chose",
      Description: "",
      Events: [],
    };
  }

  async componentDidMount() {
    const parentGuid = await this.props.parent_GUID;
    console.log(parentGuid);
    const EventsData = await loadEvent(this.props.parent_GUID);
    const newGUID = uuidv4();

    this.setState({
      Events: EventsData.reverse(),
      item_GUID: newGUID,
    });
  }

  async onEventAdd() {
    const { item_GUID, Event_Type, Order_Status, Description } = this.state;

    await handleAddEvent(
      item_GUID,
      this.props.parent_GUID,
      Event_Type,
      Order_Status,
      Description
    );

    const updatedEvents = await loadEvent(this.props.parent_GUID);
    const newGUID = uuidv4();

    this.setState({
      Events: updatedEvents.reverse(),
      item_GUID: newGUID,
      Event_Type: "chose",
      Order_Status: "chose",
      Description: "",
    });
  }

  render() {
    return (
      <div className={styles.Form}>
        <div className={styles.formContainer}>
          <div className={styles.upladContainer}>
            <FileUploader
              orderNumber={this.props.parent_GUID}
              subFolder={this.state.item_GUID}
              title={"فایل دریافتی"}
            />
            <FileUploader
              orderNumber={this.props.parent_GUID}
              subFolder={this.state.item_GUID}
              title={"فایل ارسالی"}
            />
          </div>

          <div className={styles.selectContainer}>
            <select
              value={this.state.Event_Type}
              onChange={(event) =>
                this.setState({ Event_Type: String(event.currentTarget.value) })
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

          <textarea
            placeholder="توضیحات ..."
            value={this.state.Description}
            onChange={(e) =>
              this.setState({ Description: e.currentTarget.value })
            }
          />

          <button
            className={styles.buttonSave}
            onClick={() => this.onEventAdd()}
          >
            ذخیره
          </button>
        </div>

        <div className={styles.shownHistory}>
          {this.state.Events.map((event, i) => (
            <ShownForm
              Description={event.Description}
              Event_Type={event.Event_Type}
              Display_Name={event.Display_Name}
              Order_Status={event.Order_Status}
              Created={event.Created}
              parent_GUID={this.props.parent_GUID}
              item_GUID={event.Title}
              key={i}
            />
          ))}
        </div>
      </div>
    );
  }
}
