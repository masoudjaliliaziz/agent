import { ClientSideWebPartManager } from "@microsoft/sp-webpart-base";
import { getDigest } from "./GetDigest";

export async function handleUpdateItem() {
  const listName = "MyList";
  const itemType = `SP.Data.${listName}ListItem`;
  const webUrl = "http://pm.isa.ir/development";
  const { title, currentItemId } = this.state;

  if (!title.trim()) {
    this.setState({ message: "لطفاً یک عنوان وارد کنید." });
    return;
  }

  getDigest()
    .then((digest) =>
      fetch(
        `${webUrl}/_api/web/lists/getbytitle('${listName}')/items(${currentItemId})`,
        {
          method: "POST",
          headers: {
            Accept: "application/json;odata=verbose",
            "Content-Type": "application/json;odata=verbose",
            "X-RequestDigest": digest,
            "IF-MATCH": "*",
            "X-HTTP-Method": "MERGE",
          },
          body: JSON.stringify({
            __metadata: { type: itemType },
            Title: title,
          }),
        }
      )
    )
    .then(() => {
      this.setState({
        message: `آیتم (${title}) ویرایش شد.`,
        title: "",
        isEditing: false,
        currentItemId: null,
      });
      this.loadItems();
    })
    .catch((err) => this.setState({ message: `خطا: ${err.message}` }));
}

export async function handleUpdateCartPrice(
  Id: number,
  price: number | string
) {
  const listName = "shoping";
  const itemType = `SP.Data.ShopingListItem`; // نوع داده صحیح
  const webUrl = "https://crm.zarsim.com"; // آدرس سایت SharePoint شما

  try {
    // گرفتن Digest برای ارسال درخواست
    const digest = await getDigest();
    if (!digest) {
      console.error("Digest not received");
      return;
    }

    // بررسی صحت ورودی‌ها
    if (!Id || isNaN(Number(price))) {
      console.error("Invalid Id or price");
      return;
    }

    // ارسال درخواست PATCH برای آپدیت قیمت
    const response = await fetch(
      `${webUrl}/_api/web/lists/getbytitle('${listName}')/items(${Id})`,
      {
        method: "POST",
        headers: {
          Accept: "application/json;odata=verbose",
          "Content-Type": "application/json;odata=verbose",
          "X-RequestDigest": digest,
          "IF-MATCH": "*", // می‌تواند * باشد برای تمامی آیتم‌ها
          "X-HTTP-Method": "MERGE", // استفاده از متد MERGE برای آپدیت
        },
        body: JSON.stringify({
          __metadata: { type: itemType }, // نوع داده لیست شما
          price: Number(price), // بروزرسانی قیمت
        }),
      }
    );

    // بررسی پاسخ از سرور
    if (response.ok) {
      console.log("Price updated successfully!");
    } else {
      console.error(`Error: ${response.statusText}`);
    }
  } catch (err) {
    console.error("Error during update:", err.message);
  }
}
