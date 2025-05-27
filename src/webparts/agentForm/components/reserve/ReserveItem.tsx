import * as React from "react";
import styles from "./Reserve.module.scss";
import { convertToJalaliDateTime } from "../utils/geoToJalali";

export default class ReserveItem extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      userName: null,
      userLoading: true,
      userError: null,
    };
  }

  async componentDidMount() {
    const userId = this.props.reserveData.AuthorId;

    if (!userId) {
      console.warn("AuthorId is missing, skipping user fetch");
      this.setState({ userLoading: false, userName: "نامشخص" });
      return;
    }

    try {
      const response = await fetch(
        `https://crm.zarsim.com/_api/Web/GetUserById(${userId})`,
        {
          headers: {
            Accept: "application/json;odata=verbose",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const userName = data.d.Title || "نامشخص";

      this.setState({ userName, userLoading: false });
    } catch (error) {
      console.error("Error fetching user data:", error);
      this.setState({
        userError: error.message,
        userLoading: false,
        userName: "نامشخص",
      });
    }
  }

  render() {
    const { reserveInventory, Created } = this.props.reserveData;
    const { userName, userLoading } = this.state;

    return (
      <div className={styles.reserveItemContainer}>
        <div className={styles.reserveItemRow}>
          <span>تاریخ ایجاد </span>
          <p>{convertToJalaliDateTime(Created)} </p>
        </div>
        <div className={styles.reserveItemRow}>
          <span>موجودی رزرو </span>
          <p> {reserveInventory} </p>
        </div>
        <div className={styles.reserveItemRow}>
          <span>کارشناس </span>
          <p> {userLoading ? "در حال بارگذاری..." : userName} </p>
        </div>
      </div>
    );
  }
}
