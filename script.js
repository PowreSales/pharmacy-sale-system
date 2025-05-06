const apiBase = "PASTE_YOUR_DEPLOYMENT_URL_HERE";

async function loadInventory() {
  const res = await fetch(`${apiBase}?action=getInventory`);
  const data = await res.json();
  const container = document.getElementById("inventory-list");
  container.innerHTML = "";
  data.forEach(item => {
    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `<strong>${item.Name}</strong><br/>Qty: ${item.Quantity} | Price: ${item["Cost Price"]}`;
    container.appendChild(div);
  });
}

const SALES_KEY = 'pendingSales';

function handleSale(event) {
  event.preventDefault();
  const item = document.getElementById('item-name').value;
  const qty = parseInt(document.getElementById('item-qty').value);
  const price = parseFloat(document.getElementById('item-price').value);
  const payment = document.getElementById('payment-mode').value;
  const sale = {
    timestamp: new Date().toISOString(),
    items: [{ item, qty, price }],
    payment,
    total: qty * price
  };
  saveSaleLocally(sale);
  alert("Sale saved locally.");
  event.target.reset();
  syncSales();
}

function saveSaleLocally(sale) {
  const existing = JSON.parse(localStorage.getItem(SALES_KEY)) || [];
  existing.push(sale);
  localStorage.setItem(SALES_KEY, JSON.stringify(existing));
}

async function syncSales() {
  const pending = JSON.parse(localStorage.getItem(SALES_KEY)) || [];
  if (pending.length === 0) {
    document.getElementById('sync-status').innerText = "All sales synced.";
    return;
  }
  if (!navigator.onLine) {
    document.getElementById('sync-status').innerText = `${pending.length} sales pending... (offline)`;
    return;
  }
  for (const sale of pending) {
    try {
      await fetch(`${apiBase}?action=recordSale`, {
        method: 'POST',
        body: JSON.stringify(sale),
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (err) {
      document.getElementById('sync-status').innerText = "Sync failed. Will retry.";
      return;
    }
  }
  localStorage.removeItem(SALES_KEY);
  document.getElementById('sync-status').innerText = "All sales synced.";
}

window.addEventListener('online', syncSales);
document.addEventListener('DOMContentLoaded', syncSales);

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js')
    .then(() => console.log('SW registered'))
    .catch(err => console.error('SW failed', err));
}