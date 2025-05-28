import * as React from "react";
import styles from "./Reserve.module.scss";
import { convertToJalaliDateTime } from "../utils/geoToJalali";
import { deleteVirtualInventoryItemById } from "../Crud/DeleteData";

export default class ReserveItem extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      userName: null,
      userLoading: true,
      userError: null,
      currentUserId: null,
    };
  }

  async componentDidMount() {
    const userId = this.props.reserveData.AuthorId;

    // دریافت اطلاعات کاربر لاگین‌شده
    try {
      const res = await fetch(`https://crm.zarsim.com/_api/web/currentuser`, {
        headers: {
          Accept: "application/json;odata=verbose",
        },
        credentials: "include",
      });

      const data = await res.json();
      this.setState({ currentUserId: data.d.Id });
    } catch (err) {
      console.error("Error fetching current user ID", err);
    }

    if (!userId) {
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

      const data = await response.json();
      const userName = data.d.Title || "نامشخص";

      this.setState({ userName, userLoading: false });
    } catch (error) {
      this.setState({
        userError: error.message,
        userLoading: false,
        userName: "نامشخص",
      });
    }
  }

  handleDelete = async () => {
    const confirmDelete = window.confirm("آیا از حذف این رزرو مطمئن هستید؟");

    if (!confirmDelete) return;

    try {
      await deleteVirtualInventoryItemById(this.props.reserveData.Id);
      alert("رزرو حذف شد");

      // رفرش داده‌ها پس از حذف
      if (this.props.onDeleted) {
        this.props.onDeleted();
      }
    } catch (error) {
      console.error("❌ Error deleting reservation:", error);
    }
  };

  render() {
    const { reserveInventory, Created, Id, AuthorId } = this.props.reserveData;
    const { userName, userLoading, currentUserId } = this.state;

    const canDelete = currentUserId === AuthorId;

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

        {canDelete && <button onClick={this.handleDelete} className={styles.deleteReserve}>حذف رزرو من</button>}
      </div>
    );
  }
}
