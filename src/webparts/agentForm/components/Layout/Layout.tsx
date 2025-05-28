import * as React from "react";
import styles from "./Layout.module.scss";
import { hashHistory } from "react-router";
import { loadOrders, loadOrdersByPhoneNumber } from "../Crud/GetData";
export class Layout extends React.Component<any, any> {
  constructor(props) {
    super(props);

    this.state = {
      phoneNumber: "",
    };
    this.goCart = this.goCart.bind(this);
    this.goList = this.goList.bind(this);
  }

  async componentDidMount() {
    const form_guid = sessionStorage.getItem("agent_guid");
    const phoneNumber = await loadOrders(form_guid);
    this.setState({ phoneNumber });
    const getGuidFormByPhoneNumber = await loadOrdersByPhoneNumber(phoneNumber);
  }

  goCart() {
    hashHistory.push("/cart");
  }

  goList() {
    hashHistory.push("/");
  }

  public render() {
    const pathname = this.props.location.pathname;

    let pageTitle = "";
    if (pathname === "/") {
      pageTitle = "پیگیری سفارش";
    } else if (pathname === "/cart") {
      pageTitle = "سبد خرید مشتری";
    } else if (pathname.startsWith("/product-details")) {
      pageTitle = "جزئیات محصول";
    } else if (pathname.startsWith("/order")) {
      pageTitle = "ثبت سفارش";
    } else {
      pageTitle = "صفحه ناشناخته";
    }

    return (
      <div className={styles.Layout}>
        <header className={styles.Header}>
          <p className={styles.pageTitle}>{pageTitle}</p>
          <div className={styles.btnContainer}>
            <div type="button" className={styles.btn} onClick={this.goCart}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
            </div>

            <div type="button" className={styles.btn} onClick={this.goList}>
              <svg
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            </div>
            <div className={styles.history}>{this.state.phoneNumber}</div>
          </div>
        </header>
        <main>{this.props.children}</main>
      </div>
    );
  }
}
