import { Product } from "../IAgentFormProps";
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

export async function addDiscountToTheOrderForm(guid_form: any, Data: any) {
  const digest = await getDigest();
  const webUrl = "https://crm.zarsim.com";
  const listName = "Orders";
  const itemType = "SP.Data.OrdersListItem";

  if (!guid_form) {
    console.log("شناسه کاربری پیدا نشد");
    return;
  }

  fetch(`${webUrl}/_api/web/lists/getbytitle('${listName}')/items`, {
    method: "POST",
    headers: {
      Accept: "application/json;odata=verbose",
      "Content-Type": "application/json;odata=verbose",
      "X-RequestDigest": digest,
    },
    body: JSON.stringify({
      __metadata: { type: itemType },

      ...Data,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.d) {
        console.log("تخفیف با موفقیت ثبت شد.");
      } else {
        console.log("خطا در ثبت سفارش");
      }
    });
}

export async function updateOrderFormByGuid(guid_form: string, Data: any) {
  if (!guid_form) {
    console.log("شناسه کاربری پیدا نشد");
    return;
  }

  const digest = await getDigest();
  const webUrl = "https://crm.zarsim.com";
  const listName = "Orders";
  const itemType = "SP.Data.OrdersListItem";

  const filter = `guid_form eq '${guid_form}'`;
  const queryUrl = `${webUrl}/_api/web/lists/getbytitle('${listName}')/items?$filter=${filter}`;

  const getResponse = await fetch(queryUrl, {
    method: "GET",
    headers: {
      Accept: "application/json;odata=verbose",
    },
  });

  const getData = await getResponse.json();

  if (!getData.d.results.length) {
    console.log("آیتمی با این شناسه پیدا نشد.");
    return;
  }

  const item = getData.d.results[0];
  const itemId = item.Id;

  const updateUrl = `${webUrl}/_api/web/lists/getbytitle('${listName}')/items(${itemId})`;

  const updateResponse = await fetch(updateUrl, {
    method: "POST",
    headers: {
      Accept: "application/json;odata=verbose",
      "Content-Type": "application/json;odata=verbose",
      "X-RequestDigest": digest,
      "X-HTTP-Method": "MERGE",
      "If-Match": item.__metadata.etag,
    },
    body: JSON.stringify({
      __metadata: { type: itemType },
      ...Data,
    }),
  });

  if (updateResponse.ok) {
    console.log("آیتم با موفقیت آپدیت شد.");
  } else {
    const err = await updateResponse.text();
    console.log("خطا در آپدیت آیتم:", err);
  }
}

export async function addItemToVirtualInventory(data) {
  const listName = "virtualInventory";
  const itemType = `SP.Data.VirtualInventoryListItem`;
  const webUrl = "https://crm.zarsim.com";

  try {
    const digest = await getDigest();
    console.log("Digest:", digest);
    const response = await fetch(
      `${webUrl}/_api/web/lists/getbytitle('${listName}')/items`,
      {
        method: "POST",
        headers: {
          Accept: "application/json;odata=verbose",
          "Content-Type": "application/json;odata=verbose",
          "X-RequestDigest": digest,
        },
        body: JSON.stringify({
          __metadata: { type: itemType },
          ...data,
        }),
      }
    );
    const result = await response.json();
    const reserveInventory = await result.d.reserveInventory;
    return reserveInventory;
  } catch (err) {
    console.error("❌ Error adding item to inventory:", err);
  }
}

export async function addOrUpdateItemInVirtualInventory(data: {
  guid_form: string;
  Title?: string;
  ProductCode?: string;
  status?: number;
  reserveInventory?: string;
}) {
  const listName = "virtualInventory";
  const itemType = `SP.Data.VirtualInventoryListItem`;
  const webUrl = "https://crm.zarsim.com";

  try {
    const digest = await getDigest();

    const guidForm = data.guid_form;
    const productCode = data.ProductCode;

    if (!guidForm) {
      throw new Error("guid_form is required");
    }

    let filterQuery = `guid_form eq '${guidForm}'`;

    if (
      productCode !== undefined &&
      productCode !== null &&
      productCode !== ""
    ) {
      filterQuery += ` and ProductCode eq '${productCode}'`;
    } else {
      console.warn(
        "Warning: ProductCode is undefined or empty, filtering only by guid_form"
      );
    }

    const filterUrl = `${webUrl}/_api/web/lists/getbytitle('${listName}')/items?$filter=${filterQuery}`;
    const searchResponse = await fetch(filterUrl, {
      headers: { Accept: "application/json;odata=verbose" },
    });

    if (!searchResponse.ok) {
      throw new Error(`Search failed: ${searchResponse.statusText}`);
    }

    const searchResult = await searchResponse.json();

    let itemId;

    if (searchResult.d.results.length > 0) {
      itemId = searchResult.d.results[0].Id;

      const updateData = { ...data };
      delete updateData.guid_form;

      const updateResponse = await fetch(
        `${webUrl}/_api/web/lists/getbytitle('${listName}')/items(${itemId})`,
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
            ...updateData,
          }),
        }
      );

      if (!updateResponse.ok) {
        throw new Error(`Update failed: ${updateResponse.statusText}`);
      }
    } else {
      const createResponse = await fetch(
        `${webUrl}/_api/web/lists/getbytitle('${listName}')/items`,
        {
          method: "POST",
          headers: {
            Accept: "application/json;odata=verbose",
            "Content-Type": "application/json;odata=verbose",
            "X-RequestDigest": digest,
          },
          body: JSON.stringify({
            __metadata: { type: itemType },
            ...data,
          }),
        }
      );

      if (!createResponse.ok) {
        throw new Error(`Create failed: ${createResponse.statusText}`);
      }

      const createResult = await createResponse.json();
      itemId = createResult.d.Id;
    }

    const getResponse = await fetch(
      `${webUrl}/_api/web/lists/getbytitle('${listName}')/items(${itemId})?$select=reserveInventory`,
      {
        headers: { Accept: "application/json;odata=verbose" },
      }
    );

    if (!getResponse.ok) {
      throw new Error(`Failed to get item: ${getResponse.statusText}`);
    }

    const getResult = await getResponse.json();

    return getResult.d.reserveInventory;
  } catch (err) {
    console.error("❌ Error in addOrUpdateItemInVirtualInventory:", err);
    throw err;
  }
}

export async function addOrUpdateItemInOrderableInventory({
  Code,
  orderableInventory,
}: {
  Code: string;
  orderableInventory: string;
}): Promise<string | null> {
  const listName = "orderableInventory";
  const itemType = `SP.Data.${
    listName.charAt(0).toUpperCase() + listName.slice(1)
  }ListItem`;
  const webUrl = "https://crm.zarsim.com";

  try {
    const digest = await getDigest();

    const existingItemsResponse = await fetch(
      `${webUrl}/_api/web/lists/getbytitle('${listName}')/items?$filter=Code eq '${Code}'`,
      {
        method: "GET",
        headers: {
          Accept: "application/json;odata=verbose",
        },
      }
    );

    const existingItemsData = await existingItemsResponse.json();
    const existingItem = existingItemsData.d.results[0];

    if (existingItem) {
      await fetch(
        `${webUrl}/_api/web/lists/getbytitle('${listName}')/items(${existingItem.Id})`,
        {
          method: "POST",
          headers: {
            Accept: "application/json;odata=verbose",
            "Content-Type": "application/json;odata=verbose",
            "X-RequestDigest": digest,
            "X-HTTP-Method": "MERGE",
            "If-Match": "*",
          },
          body: JSON.stringify({
            __metadata: { type: itemType },
            orderableInventory,
          }),
        }
      );

      return orderableInventory;
    } else {
      const createResponse = await fetch(
        `${webUrl}/_api/web/lists/getbytitle('${listName}')/items`,
        {
          method: "POST",
          headers: {
            Accept: "application/json;odata=verbose",
            "Content-Type": "application/json;odata=verbose",
            "X-RequestDigest": digest,
          },
          body: JSON.stringify({
            __metadata: { type: itemType },
            Code,
            orderableInventory,
          }),
        }
      );

      const createdItem = await createResponse.json();
      return createdItem.d.orderableInventory;
    }
  } catch (err) {
    console.error("❌ خطا در افزودن یا بروزرسانی:", err);
    return null;
  }
}

export async function addToCart(product: Product): Promise<void> {
  const agentGuid = sessionStorage.getItem("agent_guid");
  if (!agentGuid) {
    alert("شناسه نماینده پیدا نشد.");
    return;
  }

  const postData = {
    __metadata: {
      type: "SP.Data.ShopingListItem",
    },
    Title: product.Title,
    codegoods: product.Code,
    guid_form: agentGuid,
    count: "1",
    price: Number(product.Price),
    size: product.size,
    color: product.color,
    IdCode: product.IdCode,
  };

  try {
    const digest = await getDigest();

    const response = await fetch(
      "https://crm.zarsim.com/_api/web/lists/getbytitle('shoping')/items",
      {
        method: "POST",
        headers: {
          Accept: "application/json;odata=verbose",
          "Content-Type": "application/json;odata=verbose",
          "X-RequestDigest": digest,
        },
        body: JSON.stringify(postData),
      }
    );

    const resultText = await response.text();

    if (!response.ok) {
      throw new Error("خطا در افزودن به سبد خرید");
    }
  } catch (error) {
    console.error("❌ خطا:", error);
    alert("افزودن به سبد خرید با خطا مواجه شد.");
  }
}

export async function updatePreInvoiceCreateField(guid_form: string, data) {
  const webUrl = "https://crm.zarsim.com";
  const digest = await getDigest();
  const listName = "Orders";
  const itemType = `SP.Data.${
    listName.charAt(0).toUpperCase() + listName.slice(1)
  }ListItem`;

  const getUrl = `${webUrl}/_api/web/lists/getbytitle('${listName}')/items?$filter=guid_form eq '${guid_form}'&$top=1`;

  try {
    const getResponse = await fetch(getUrl, {
      method: "GET",
      headers: {
        Accept: "application/json;odata=verbose",
      },
    });

    const getData = await getResponse.json();

    if (getData.d.results.length === 0) {
      console.error(`❌ No item found with guid_form: ${guid_form}`);
      return;
    }

    const itemId = getData.d.results[0].Id;

    const updateUrl = `${webUrl}/_api/web/lists/getbytitle('${listName}')/items(${itemId})`;

    const updateResponse = await fetch(updateUrl, {
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
        Pre_Invoice_Create: "1",
        coName: data.coName,
        customerNationalCode: data.customerNationalCode,
        address: data.address,
        postalCode: data.postalCode,
        customerMobile: data.customerMobile,
        phoneNumber: data.phoneNumber,
        economicalCode: data.economicalCode,
      }),
    });

    if (updateResponse.ok) {
      alert(`✅ آیتم با موفقیت بروزرسانی شد`);
    } else {
      alert("❌ خطا در بروزسانی آیتم  ");
    }
  } catch (error) {
    console.error(`❌ Fetch error updating item ${guid_form}:`, error);
  }
}
