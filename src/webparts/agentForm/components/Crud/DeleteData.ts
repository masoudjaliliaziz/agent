import { getDigest } from "./GetDigest";

export async function handleDeleteItem(id: number) {
  const listName = "MyList";
  const webUrl = "http://pm.isa.ir/development";

  getDigest()
    .then((digest) =>
      fetch(`${webUrl}/_api/web/lists/getbytitle('${listName}')/items(${id})`, {
        method: "POST",
        headers: {
          Accept: "application/json;odata=verbose",
          "X-RequestDigest": digest,
          "IF-MATCH": "*",
          "X-HTTP-Method": "DELETE",
        },
      })
    )
    .then(() => {
      this.setState({ message: "آیتم حذف شد." });
      this.loadItems();
    })
    .catch((err) => this.setState({ message: `خطا در حذف: ${err.message}` }));
}

export async function deleteVirtualInventoryItemById(itemId: number) {
  const webUrl = "https://crm.zarsim.com";
  const listName = "virtualInventory";

  const digest = await getDigest();

  const response = await fetch(`${webUrl}/_api/web/lists/getbytitle('${listName}')/items(${itemId})`, {
    method: "POST",
    headers: {
      Accept: "application/json;odata=verbose",
      "X-RequestDigest": digest,
      "IF-MATCH": "*",
      "X-HTTP-Method": "DELETE",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("❌ خطا در حذف رزرو");
  }
}
