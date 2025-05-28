import * as React from "react";
import styles from "./History.module.scss";
import { convertToJalaliDateTime } from "../utils/geoToJalali";
import AppRouter from "../Router/AppRouter";
export default class OrderHistoryItem extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      showSuccessPopup: false,
      //   loading: true,
    };
  }

  render() {
    const { OrderNumber, Created, GUID } = this.props.data;
    return (
      <div className={styles.orderRow}>
        <div className={styles.OrderItem}>
          <small>شماره سفارش</small>
          <p>{OrderNumber}</p>
        </div>
        <div className={styles.OrderItem}>
          <small> تاریخ ایجاد</small>
          <p>{convertToJalaliDateTime(Created)}</p>
        </div>
        <div
          className={styles.detailBtn}
          onClick={() => this.setState({ showSuccessPopup: true })}
        >
          مشاهده تاریخچه سفارش
        </div>
        {this.state.showSuccessPopup && (
          <div className={styles.popupOverlay}>
            <div className={styles.popupBox}>
              در دست احداث
              <div
                className={styles.closePopupBtn}
                onClick={() => {
                  this.setState({ showSuccessPopup: false });
                }}
              >
                بستن
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}
