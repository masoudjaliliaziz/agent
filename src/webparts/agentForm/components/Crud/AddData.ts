import { getDigest } from "./GetDigest";

export async function handleAddItem(
  title: string,
  setState: (state: any) => void,
  onReload: () => void
) {
  const listName = "shoping";
  const itemType = `SP.Data.${listName}ListItem`;
  const webUrl = "https://crm.zarsim.com";

  if (!title.trim()) {
    setState({ message: "لطفاً یک عنوان وارد کنید." });
    return;
  }

  try {
    const digest = await getDigest();

    await fetch(`${webUrl}/_api/web/lists/getbytitle('${listName}')/items`, {
      method: "POST",
      headers: {
        Accept: "application/json;odata=verbose",
        "Content-Type": "application/json;odata=verbose",
        "X-RequestDigest": digest,
      },
      body: JSON.stringify({
        __metadata: { type: itemType },
        Title: title,
      }),
    });

    setState({ message: `آیتم جدید (${title}) اضافه شد.`, title: "" });
    onReload();
  } catch (err) {
    setState({ message: `خطا: ${err.message}` });
  }
}

export async function handleAddPrice(Id: number, price: number | string) {
  const listName = "shoping";
  const itemType = `SP.Data.${listName}ListItem`;
  const webUrl = "https://crm.zarsim.com";

  try {
    const digest = await getDigest();

    await fetch(
      `${webUrl}/_api/web/lists/getbytitle('${listName}')/items(${Id})`,
      {
        method: "POST",
        headers: {
          Accept: "application/json;odata=verbose",
          "Content-Type": "application/json;odata=verbose",
          "X-RequestDigest": digest,
        },
        body: JSON.stringify({
          __metadata: { type: itemType },
          price: price,
        }),
      }
    );
    console.log("everything is ok");
  } catch (err) {
    console.error(err.message);
  }
}

export async function handleAddEvent(
  item_GUID: string,
  parent_GUID: string,
  Event_Type: string,
  Order_Status: string,
  Description: string
) {
  const listName = "Events";
  const itemType = `SP.Data.EventsListItem`;
  const webUrl = "https://crm.zarsim.com";

  try {
    const digest = await getDigest();

    await fetch(`${webUrl}/_api/web/lists/getbytitle('${listName}')/items`, {
      method: "POST",
      headers: {
        Accept: "application/json;odata=verbose",
        "Content-Type": "application/json;odata=verbose",
        "X-RequestDigest": digest,
      },
      body: JSON.stringify({
        __metadata: { type: itemType },
        Parent_GUID: parent_GUID,
        Title: item_GUID,
        Event_Type,
        Order_Status,
        Description,
      }),
    });
    console.log("everything is ok");
  } catch (err) {
    console.error(err.message);
  }
}
