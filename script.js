const apiBase = "PASTE_YOUR_DEPLOYMENT_URL_HERE"; // e.g. https://script.google.com/macros/s/AKfycb.../exec

async function loadInventory() {
  const res = await fetch(`${apiBase}?action=getInventory`);
  const data = await res.json();

  const container = document.getElementById("inventory-list");
  container.innerHTML = "";

  data.forEach(item => {
    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `
      <strong>${item.Name}</strong><br/>
      Qty: ${item.Quantity} | Price: ${item["Cost Price"]}
    `;
    container.appendChild(div);
  });
}
