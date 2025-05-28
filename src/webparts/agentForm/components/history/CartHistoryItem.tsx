import * as React from "react";
import styles from "./History.module.scss";
import { convertToJalaliDateTime } from "../utils/geoToJalali";

export default class CartHistoryItem extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      userName: null,
      userLoading: true,
      userError: null,
    };
  }

  async componentDidMount() {}

  render() {
    const { Created, Title, codegoods, productgroup, size } =
      this.props.HistoryData;

    return (
      <div className={styles.reserveItemContainer}>
        <div className={styles.reserveItemRow}>
          <span className={styles.slag}>تاریخ ایجاد </span>
          <p>{convertToJalaliDateTime(Created)} </p>
        </div>
        <div className={styles.reserveItemRow}>
          <span className={styles.slag}>نام محصول </span>
          <p> {Title} </p>
        </div>
        <div className={styles.reserveItemRow}>
          <span className={styles.slag}>کد محصول </span>
          <p>{codegoods}</p>
        </div>
        <div className={styles.reserveItemRow}>
          <span className={styles.slag}> گروه محصول </span>
          <p>{productgroup}</p>
        </div>
        <div className={styles.reserveItemRow}>
          <span className={styles.slag}>سایز </span>
          <p>{size}</p>
        </div>
      </div>
    );
  }
}
