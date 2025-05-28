import * as React from "react";
import { Component } from "react";
import styles from "./Form.module.scss";
import { FormProps } from "../IAgentFormProps";
import uuidv4 from "../utils/createGuid";
import { handleAddEvent } from "../Crud/AddData";
import { loadEvent } from "../Crud/GetData";
import ShownForm from "./ShownForms";
import { FileUploader } from "../utils/FileUploader";

export default class Form extends Component<FormProps, any> {
  private sendRef: FileUploader | null = null;
  private reciveRef: FileUploader | null = null;

  constructor(props: FormProps) {
    super(props);
    this.state = {
      item_GUID: "",
      Event_Type: "chose",
      Order_Status: "chose",
      Description: "",
      Events: [],
    };

    this.onEventAdd = this.onEventAdd.bind(this);
    this.loadData = this.loadData.bind(this);
  }

  async componentDidMount() {
    if (this.props.parent_GUID) {
      this.loadData(this.props.parent_GUID);
    }
  }

  async componentDidUpdate(prevProps: FormProps) {
    if (
      prevProps.parent_GUID !== this.props.parent_GUID &&
      this.props.parent_GUID
    ) {
      this.loadData(this.props.parent_GUID);
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

  render() {
    return (
      <div className={styles.Form}>
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


          <div className={styles.buttonSave} onClick={this.onEventAdd}>
            ذخیره
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

