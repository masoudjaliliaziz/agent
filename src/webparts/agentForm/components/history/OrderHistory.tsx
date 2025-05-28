import * as React from "react";
import OrderHistoryItem from "./OrderHistoryItem";
import styles from "./History.module.scss";

export default class OrderHistory extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      //   reserveInventories: [],
      //   loading: true,
    };
  }

  render() {
    const { history } = this.props;
    return (
      <div className={styles.OrderContainer}>
        {history.reverse().map((data, index) => (
          <OrderHistoryItem data={data} key={index} />
        ))}
      </div>
    );
  }
}
