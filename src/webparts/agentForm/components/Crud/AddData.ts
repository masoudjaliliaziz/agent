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

  // مرحله 1: پیدا کردن آیتم با guid_form برابر ورودی
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

  // فرض می‌گیریم فقط یک آیتم داریم با این guid_form
  const item = getData.d.results[0];
  const itemId = item.Id;

  // مرحله 2: آپدیت آیتم با استفاده از ID
  const updateUrl = `${webUrl}/_api/web/lists/getbytitle('${listName}')/items(${itemId})`;

  const updateResponse = await fetch(updateUrl, {
    method: "POST", // برای آپدیت در SP REST API از POST + X-HTTP-Method: MERGE استفاده می‌کنیم
    headers: {
      Accept: "application/json;odata=verbose",
      "Content-Type": "application/json;odata=verbose",
      "X-RequestDigest": digest,
      "X-HTTP-Method": "MERGE",
      "If-Match": item.__metadata.etag, // برای جلوگیری از override ناخواسته
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

    // if (!response.ok) {
    //   throw new Error(`Server responded with status ${response.status}`);
    // }
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

    // جستجو در لیست با فیلتر
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
