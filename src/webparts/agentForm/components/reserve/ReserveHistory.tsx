import * as React from "react";
import styles from "./Reserve.module.scss";
import { loadReservedInventoryByCode } from "../Crud/GetData";
import ReserveItem from "./ReserveItem";

export default class ReserveHistory extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      reserveInventories: [],
      loading: true,
    };
  }

  async componentDidMount() {
    const productCode = this.props.productCode;
    const reserveInventories = await loadReservedInventoryByCode(productCode);
    this.setState({ reserveInventories, loading: false });

    const totalReserved = reserveInventories.reduce((acc, item) => {
      const resInv = parseInt(item.reserveInventory) || 0;
      return acc + resInv;
    }, 0);

    if (this.props.onReservedTotalChange) {
      this.props.onReservedTotalChange(totalReserved);
    }
  }

  render() {
    const { reserveInventories, loading } = this.state;

    return (
      <div className={styles.container}>
        {loading ? (
          <p>در حال بارگذاری دیتا ...</p>
        ) : reserveInventories.length === 0 ? (
          <p>هیچ موجودی رزروی وجود ندارد</p>
        ) : (
          reserveInventories.map((data, index) => (
            <ReserveItem
              key={index}
              reserveData={data}
              onReservedTotalChange={this.props.onReservedTotalChange}
              onDeleted={() => this.componentDidMount()}
            />
          ))
        )}
      </div>
    );
  }
}
