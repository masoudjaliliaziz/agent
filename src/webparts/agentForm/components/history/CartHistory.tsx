import * as React from "react";
import styles from "./History.module.scss";
import { loadHistoryShopping } from "../Crud/GetData";
import ReserveItem from "./CartHistoryItem";
import CartHistoryItem from "./CartHistoryItem";

export default class CartHistory extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      cartHistoryData: [],
      loading: true,
    };
  }

  async componentDidMount() {
    const guid_form = sessionStorage.getItem("agent_guid");

    const cartHistoryData = await loadHistoryShopping(guid_form);

    // مرتب‌سازی بر اساس فیلد تاریخ (فرضاً Created)
    const sortedData = cartHistoryData.sort((a, b) => {
      return new Date(b.Created).getTime() - new Date(a.Created).getTime();
    });

    this.setState({ cartHistoryData: sortedData, loading: false });
  }

  render() {
    const { cartHistoryData, loading } = this.state;

    return (
      <div className={styles.container}>
        {loading ? (
          <p>در حال بارگذاری دیتا ...</p>
        ) : cartHistoryData.length === 0 ? (
          <p> هیچ سابقه خریدی موجود نیست</p>
        ) : (
          cartHistoryData.map((data, index) => (
            <CartHistoryItem key={index} HistoryData={data} />
          ))
        )}
      </div>
    );
  }
}
