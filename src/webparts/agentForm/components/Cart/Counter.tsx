import * as React from "react";
import { getDigest } from "../Crud/GetDigest";
import styles from "./Counter.module.scss";

class Counter extends React.Component<any, any> {
  private listName = "shoping";
  private webUrl = "https://crm.zarsim.com";

  constructor(props) {
    super(props);
    this.state = {
      count: 0,
      displayCount: 0,
      loading: true,
    };
  }

  async componentDidMount() {
    await this.fetchQuantity();
  }

  fetchQuantity = async () => {
    const { Id, onCountChange } = this.props;
    try {
      const response = await fetch(
        `${this.webUrl}/_api/web/lists/getbytitle('${this.listName}')/items(${Id})`,
        {
          headers: {
            Accept: "application/json;odata=verbose",
          },
        }
      );
      const data = await response.json();
      const count = Number(data.d.count) || 0;
      this.setState({ count, displayCount: count, loading: false });
      onCountChange?.(count);
    } catch (error) {
      console.error("❌ Fetch quantity error:", error);
      this.setState({ loading: false });
    }
  };

  updateQuantity = async (newCount: number) => {
    const { Id, onDelete, onCountChange } = this.props;
    const url = `${this.webUrl}/_api/web/lists/getbytitle('${this.listName}')/items(${Id})`;
    const digest = await getDigest();

    if (newCount === 0) {
      // حذف آیتم
      try {
        await fetch(url, {
          method: "POST",
          headers: {
            Accept: "application/json;odata=verbose",
            "X-RequestDigest": digest,
            "IF-MATCH": "*",
            "X-HTTP-Method": "DELETE",
          },
        });
        this.setState({ count: 0, displayCount: 0 });
        onDelete?.(Id);
      } catch (error) {
        console.error("❌ Delete item error:", error);
      }
    } else {
      // به‌روزرسانی مقدار
      try {
        await fetch(url, {
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
        });
        this.setState({ count: newCount, displayCount: newCount });
        onCountChange?.(newCount);
      } catch (error) {
        console.error("❌ Update quantity error:", error);
      }
    }
  };

  increment = () => {
    const newCount = this.state.displayCount + 1;
    this.updateQuantity(newCount);
  };

  decrement = () => {
    const current = this.state.displayCount;
    const newCount = Math.max(0, current - 1);
    this.setState({ displayCount: newCount });
    this.updateQuantity(newCount);
  };

  handleInputChange = (e) => {
    const value = parseInt(e.target.value, 10);
    const newCount = isNaN(value) || value < 0 ? 0 : value;
    this.setState({ displayCount: newCount });
  };

  handleInputBlur = () => {
    const { displayCount } = this.state;
    this.updateQuantity(displayCount);
  };

  render() {
    const { displayCount, loading } = this.state;

    if (loading) return <div>در حال بارگذاری...</div>;

    return (
      <div className={styles.buttonContainer}>
        <button type="button" onClick={this.decrement}>
          -
        </button>
        <input
          type="text"
          min={0}
          value={displayCount}
          onChange={this.handleInputChange}
          onBlur={this.handleInputBlur}
        />
        <button type="button" onClick={this.increment}>
          +
        </button>
      </div>
    );
  }
}

export default Counter;
