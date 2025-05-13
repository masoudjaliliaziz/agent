import * as React from "react";
import { getDigest } from "../Crud/GetDigest";
import styles from "./Counter.module.scss";
class Counter extends React.Component<any, any> {
  private listName = "shoping";
  private webUrl = "https://crm.zarsim.com";

  constructor(props: any) {
    super(props);
    this.state = {
      count: 0,
      displayCount: 0,
      loading: true,
    };
  }

  async componentDidMount() {
    this.fetchQuantity();
  }

  fetchQuantity = () => {
    const { Id } = this.props;

    fetch(
      `${this.webUrl}/_api/web/lists/getbytitle('${this.listName}')/items(${Id})`,
      {
        headers: {
          Accept: "application/json;odata=verbose",
        },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        const count = data.d.count;
        this.setState({ count, displayCount: count, loading: false });
      })
      .catch((error) => {
        console.error("Fetch quantity error:", error);
        this.setState({ loading: false });
      });
  };

  updateQuantity = async (newCount: number) => {
    const digest = await getDigest();
    const { Id, onDelete } = this.props;
    const url = `${this.webUrl}/_api/web/lists/getbytitle('${this.listName}')/items(${Id})`;

    if (newCount === 0) {
      // حذف آیتم
      fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json;odata=verbose",
          "X-RequestDigest": digest,
          "IF-MATCH": "*",
          "X-HTTP-Method": "DELETE",
        },
      })
        .then(() => {
          this.setState({ count: 0, displayCount: 0 });
          if (onDelete) onDelete(Id); // اطلاع به والد برای حذف از DOM
        })
        .catch((error) => console.error("Delete item error:", error));
    } else {
      // بروزرسانی
      fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json;odata=verbose",
          "Content-Type": "application/json;odata=verbose",
          "X-RequestDigest": digest,
          "IF-MATCH": "*",
          "X-HTTP-Method": "MERGE",
        },
        body: JSON.stringify({
          __metadata: { type: "SP.Data.ShopingListItem" },
          count: String(newCount),
        }),
      })
        .then(() => {
          this.setState({ count: newCount, displayCount: newCount });
        })
        .catch((error) => console.error("Update quantity error:", error));
    }
  };

  increment = () => {
    const newCount = Number(this.state.displayCount) + 1;
    this.updateQuantity(newCount);
  };

  decrement = () => {
    const current = Number(this.state.displayCount);
    if (current === 1) {
      this.setState({ displayCount: 0 }); // اول UI صفر بشه
      this.updateQuantity(0); // بعد حذف آیتم
    } else {
      const newCount = Math.max(0, current - 1);
      this.updateQuantity(newCount);
    }
  };

  render() {
    const { displayCount, loading } = this.state;
    if (loading) return <div>Loading...</div>;

    return (
      <div className={styles.buttonContainer}>
        <button onClick={this.decrement}>-</button>
        <span>{displayCount}</span>
        <button onClick={this.increment}>+</button>
      </div>
    );
  }
}

export default Counter;
