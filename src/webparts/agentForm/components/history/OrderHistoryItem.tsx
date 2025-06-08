import * as React from "react";
import styles from "./History.module.scss";
import { convertToJalaliDateTime } from "../utils/geoToJalali";

import ShownOrder from "./ShownOrder";
export default class OrderHistoryItem extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      showSuccessPopup: false,
    };
  }

  render() {
    const { OrderNumber, Created, guid_form } = this.props.data;
    const isActiveOrderHistory =
      guid_form === sessionStorage.getItem("agent_guid");
    return (
      <div
        className={
          isActiveOrderHistory ? styles.activeOrderRow : styles.orderRow
        }
      >
        <div className={styles.OrderItem}>
          <small>شماره سفارش</small>
          <p>{OrderNumber}</p>
        </div>
        <div className={styles.OrderItem}>
          <small> تاریخ ایجاد</small>
          <p>{convertToJalaliDateTime(Created)}</p>
        </div>
        {isActiveOrderHistory && (
          <div className={styles.OrderItemActive}>
            <small> سفارش فعال</small>
          </div>
        )}

        {!isActiveOrderHistory && (
          <div
            className={styles.detailBtn}
            onClick={() => this.setState({ showSuccessPopup: true })}
          >
            مشاهده تاریخچه سفارش
          </div>
        )}
        {this.state.showSuccessPopup && (
          <div className={styles.popupOverlay}>
            <div className={styles.popupBox}>
              <ShownOrder GUID={guid_form} Created={Created} />
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
