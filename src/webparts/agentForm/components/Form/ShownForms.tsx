import * as React from "react";
import { Component } from "react";
import styles from "./ShownForm.module.scss";
import { FormProps, ShownFormProps } from "../IAgentFormProps";

import { convertIsoToJalali } from "../utils/convertToJalali";

export default class ShownForm extends Component<ShownFormProps, any> {
  constructor(props: FormProps) {
    super(props);
  }

  async componentDidMount() {}

  render() {
    return (
      <div className={styles.formContainer}>
        <div className={styles.selectContainer}>
          {/* <button className={styles.reciveBtn}>فایل دریافتی</button>
          <button className={styles.sendBtn}>فایل ارسالی</button> */}
          <div className={styles.ColData}>
            <div>
              <small>نوع رویداد</small>
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

            <div>
              <small>وضعیت سفارش</small>
              <p>{this.props.Order_Status}</p>
            </div>
          </div>
          <div className={styles.ColData}>
            <div>
              <small>ایجاد شده توسط </small>
              <p>{this.props.Display_Name}</p>
            </div>
            <div>
              <small> تاریخ ایجاد </small>
              <p>{convertIsoToJalali(this.props.Created)}</p>
            </div>
          </div>
        </div>
        <div className={styles.Description}>
          <p>توضیحات</p>
          <div>{this.props.Description}</div>
        </div>
      </div>
    );
  }
}
