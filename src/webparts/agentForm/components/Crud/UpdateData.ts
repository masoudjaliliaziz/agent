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

export async function handleUpdateCartPrice(id: number, data: any) {
  const listName = "shoping";
  const webUrl = "https://crm.zarsim.com";

  try {
    // دریافت Digest برای احراز هویت
    const digestResponse = await fetch(`${webUrl}/_api/contextinfo`, {
      method: "POST",
      headers: {
        Accept: "application/json;odata=verbose",
      },
    });

    const digestData = await digestResponse.json();
    const digestValue = digestData.d.GetContextWebInformation.FormDigestValue;

    // دریافت ListItemEntityTypeFullName
    const entityTypeResponse = await fetch(
      `${webUrl}/_api/web/lists/getbytitle('${listName}')?$select=ListItemEntityTypeFullName`,
      {
        method: "GET",
        headers: {
          Accept: "application/json;odata=verbose",
        },
      }
    );

    const entityTypeData = await entityTypeResponse.json();
    const listItemEntityType = entityTypeData.d.ListItemEntityTypeFullName;

    // ارسال MERGE با __metadata
    const updateResponse = await fetch(
      `${webUrl}/_api/web/lists/getbytitle('${listName}')/items(${id})`,
      {
        method: "POST",
        headers: {
          Accept: "application/json;odata=verbose",
          "Content-Type": "application/json;odata=verbose",
          "X-RequestDigest": digestValue,
          "IF-MATCH": "*",
          "X-HTTP-Method": "MERGE",
        },
        body: JSON.stringify({
          __metadata: { type: listItemEntityType },
          price: data.price,
          discountPersenTage: data.discountPersenTage,
          discountAmount: data.discountAmount,
          priceAfterDiscount: data.priceAfterDiscount,
        }),
      }
    );

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      throw new Error("Update failed: " + errorText);
    }

    console.log("✅ Updated item successfully");
  } catch (error) {
    console.error("❌ Error updating item:", error);
  }
}
