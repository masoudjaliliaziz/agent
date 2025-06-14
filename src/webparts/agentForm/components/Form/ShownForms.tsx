import * as React from "react";
import { Component } from "react";
import styles from "./ShownForm.module.scss";
import { FormProps, ShownFormProps } from "../IAgentFormProps";

import { convertIsoToJalali } from "../utils/convertToJalali";
import { loadFiles } from "../Crud/GetData";
import { convertToJalaliDateTime } from "../utils/geoToJalali";

export default class ShownForm extends Component<ShownFormProps, any> {
  constructor(props: FormProps) {
    super(props);
    this.state = {
      EventRecive: [],
      EventSend: [],
    };
  }

  async componentDidMount() {
    const { parent_GUID, item_GUID } = this.props;
    if (parent_GUID && item_GUID) {
      const fileNamesREecive = await loadFiles(
        `${parent_GUID}/${item_GUID}/recive`
      );
      this.setState({ EventRecive: fileNamesREecive });
      const fileNamesSend = await loadFiles(`${parent_GUID}/${item_GUID}/send`);
      this.setState({ EventSend: fileNamesSend });
    }
  }

  render() {
    return (
      <div className={styles.formContainer}>
        <div className={styles.selectContainer}>
          <div className={styles.ColData}>
            <div className={styles.ColDataDiv}>
              <small className={styles.ColDataSmall}>نوع رویداد</small>
              <p
                className={
                  this.props.Event_Type === "phoneNumber"
                    ? styles.pPhone
                    : this.props.Event_Type === "whatsapp"
                    ? styles.pWhatsApp
                    : this.props.Event_Type === "telegram"
                    ? styles.pTelegram
                    : this.props.Event_Type === "email"
                    ? styles.pEmail
                    : styles.pPeresental
                }
              >
                {this.props.Event_Type === "phoneNumber"
                  ? "تماس تلفنی"
                  : this.props.Event_Type === "whatsapp"
                  ? "واتساپ"
                  : this.props.Event_Type === "telegram"
                  ? "تلگرام"
                  : this.props.Event_Type === "email"
                  ? "ایمیل"
                  : "حضوری"}
              </p>
            </div>

            <div className={styles.ColDataDiv}>
              <small className={styles.ColDataSmall}>وضعیت سفارش</small>
              <p className={styles.ColDataP}>{this.props.Order_Status}</p>
            </div>
          </div>
          <div className={styles.ColData}>
            <div className={styles.ColDataDiv}>
              <small className={styles.ColDataSmall}>ایجاد شده توسط </small>
              <p className={styles.ColDataP}>{this.props.Display_Name}</p>
            </div>
            <div className={styles.ColDataDiv}>
              <small className={styles.ColDataSmall}> تاریخ ایجاد </small>
              <p className={styles.ColDataP}>
                {convertToJalaliDateTime(this.props.Created)}
              </p>
            </div>
          </div>
        </div>
        <div className={styles.Description}>
          <p className={styles.descriptionP}>توضیحات</p>
          <div className={styles.descriptionDiv}>{this.props.Description}</div>
        </div>
        <div className={styles.colDataLinks}>
          {this.state.EventRecive.map((e, i) => (
            <div className={styles.ColDataLinkRecive}>
              <a href={e.url} key={i} download>
                {e.name}
              </a>
              <small>فایل دریافتی</small>
            </div>
          ))}
          {this.state.EventSend.map((e, i) => (
            <div className={styles.ColDataLinkSend}>
              <a href={e.url} key={i} download>
                {e.name}
              </a>
              <small>فایل ارسالی</small>
            </div>
          ))}
        </div>
      </div>
    );
  }
}
