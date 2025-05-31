import * as React from "react";
import { loadEvent } from "../Crud/GetData";
import ShownForm from "../Form/ShownForms";
import styles from "./ShownOrder.module.scss";
import { convertToJalaliDateTime } from "../utils/geoToJalali";
import HistoryCart from "./HistoryCart";

export default class ShownOrder extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      error: null,
      eventData: null,
      showSuccessPopup: false,
    };
  }

  async componentDidMount() {
    const { GUID } = this.props;

    if (!GUID) {
      this.setState({ error: "شناسه معتبر نیست" });
      return;
    }

    this.setState({ loading: true, error: null });
    try {
      const eventData = await loadEvent(GUID);
      console.log("داده دریافت شده:", eventData);

      if (!eventData || (Array.isArray(eventData) && eventData.length === 0)) {
        this.setState({ error: "هیچ داده‌ای برای این شناسه یافت نشد" });
      } else {
        this.setState({ eventData, showSuccessPopup: true });
      }
    } catch (error) {
      console.error("خطا در دریافت داده:", error);
      this.setState({ error: "خطا در دریافت داده‌ها" });
    } finally {
      this.setState({ loading: false });
    }
  }

  render() {
    const { GUID, Created } = this.props;
    const { loading, error, eventData, showSuccessPopup } = this.state;

    return (
      <div className={styles.shownOrderContainer}>
        <h3> تاریخ و ساعت ایجاد سفارش {convertToJalaliDateTime(Created)}</h3>
        {loading && <p>در حال بارگذاری...</p>}

        {error && <p style={{ color: "red" }}>{error}</p>}

        {eventData && (
          <div className={styles.formContainer}>
            {/* فرض کردم eventData یک شیء است، بسته به ساختار آن می‌تونی اینجا داده‌ها را نمایش بدی */}
            {eventData.map((data, index) => (
              <ShownForm
                Display_Name={data.Display_Name}
                Created={data.Created}
                Description={data.Description}
                Event_Type={data.Event_Type}
                parent_GUID={GUID}
                item_GUID={data.Title}
                Order_Status={data.Order_Status}
              />
            ))}
            {/* نمایش بقیه اطلاعات */}
          </div>
        )}
        <HistoryCart guid={GUID} />
      </div>
    );
  }
}
