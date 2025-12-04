// ==========================
// NAVBAR MENU
// ==========================
const navbarNav = document.querySelector(".navbar-nav");
const cake = document.querySelector("#cake-menu");

cake.onclick = () => {
  navbarNav.classList.toggle("active");
};

// ==========================
// SEARCH SYSTEM
// ==========================
const searchForm = document.querySelector(".search-form");
const searchInput = document.querySelector(".search-form input");
const searchButton = document.querySelector("#search-button");

// buka & tutup kolom search
searchButton.onclick = (e) => {
  e.preventDefault();
  searchForm.classList.toggle("active");

  // sembunyikan ikon search
  searchButton.style.display = searchForm.classList.contains("active")
    ? "none"
    : "inline-block";

  // fokuskan input
  if (searchForm.classList.contains("active")) searchInput.focus();
};

// tombol search dalam input klik = sama seperti enter
document.querySelector(".search-form label").onclick = function () {
  searchInput.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
};

// fungsi enter
searchInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();

    const keyword = searchInput.value.toLowerCase().trim();
    // special-case keywords that should go to the top/hero section
    if (keyword === "home" || keyword === "beranda") {
      const homeEl = document.getElementById("home");
      if (homeEl) {
        homeEl.scrollIntoView({ behavior: "smooth", block: "start" });
        // close the search UI and mark as found
        searchForm.classList.remove("active");
        searchButton.style.display = "inline-block";
        found = true;
        return;
      }
    }
    const sections = document.querySelectorAll(
      "section, .menu-card, .about, .contact, .hero"
    );

    let found = false;

    sections.forEach((section) => {
      if (section.innerText.toLowerCase().includes(keyword)) {
        found = true;
        section.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });

    if (found) {
      searchForm.classList.remove("active");
      searchButton.style.display = "inline-block";
    } else {
      alert("Halaman tidak ditemukan!");
    }
    // clear input after search
    try {
      searchInput.value = "";
    } catch (err) {}
  }
});

// ==========================
// KLIK DI LUAR UNTUK MENUTUP
// ==========================
document.addEventListener("click", function (e) {
  // tutup navbar
  if (!cake.contains(e.target) && !navbarNav.contains(e.target)) {
    navbarNav.classList.remove("active");
  }

  // tutup search
  if (!searchButton.contains(e.target) && !searchForm.contains(e.target)) {
    searchForm.classList.remove("active");
    searchButton.style.display = "inline-block";
  }
});

// ==========================
// POPUP MENU
// ==========================
function openModal(image, title, price) {
  // if the menu is blocked, show apology and don't open modal
  if (isBlocked(title)) {
    showCustomAlert("Maaf, menu ini hanya dapat dibeli di tempat.");
    return;
  }

  document.getElementById("modalImage").src = image;
  document.getElementById("modalTitle").innerText = title;
  document.getElementById("modalPrice").innerText = price;

  // reset qty on open
  currentQty = 1;
  const qtyElOpen = document.getElementById("qty");
  if (qtyElOpen) qtyElOpen.innerText = currentQty;

  document.getElementById("menuModal").style.display = "flex";
  // disable page scroll while modal open
  document.body.classList.add("noscroll");
}

function closeModal() {
  document.getElementById("menuModal").style.display = "none";
  // re-enable page scroll
  document.body.classList.remove("noscroll");
}

function backToMenu() {
  closeModal();
  window.location.hash = "#menu";
}

// ==========================
// POPUP BUTTONS FUNCTIONALITY
// ==========================
let currentQty = 1;

// Whatsapp seller number (you can provide local number; will be normalized)
const SELLER_WHATSAPP = "0895339069161"; // user-provided number (will be converted to international format)

function openWhatsApp(message) {
  let phone = (SELLER_WHATSAPP || "").replace(/\D/g, "");
  // normalize local Indonesian numbers starting with 0 -> replace with 62
  if (phone.startsWith("0")) phone = "62" + phone.slice(1);
  const base = "https://api.whatsapp.com/send";
  const params = new URLSearchParams({ phone, text: message });
  const url = `${base}?${params.toString()}`;
  window.open(url, "_blank");
}

// List of blocked menu keywords (menus that cannot be bought online)
function isBlocked(title) {
  if (!title) return false;
  const blocked = [
    "espresso",
    "v60",
    "v60 pour over",
    "japanese iced coffee",
    "japanese iced coffe",
    "teh herbal",
    "hazelnut",
    "hazelnut latte",
    "strawberry matcha",
    "strawbery matcha",
    "chocolate pudding",
    "blue ocean",
    "blue ocean soda",
    "strawberry mojito",
    "strawbery mojito",
    "lemon mint",
    "lemon mint mojito",
  ];
  const t = title.toLowerCase().trim();
  return blocked.some((b) => t.includes(b));
}

function changeQty(delta) {
  currentQty = Math.max(1, currentQty + delta);
  const qtyEl = document.getElementById("qty");
  if (qtyEl) qtyEl.innerText = currentQty;
}

function addToCart() {
  const title = document.getElementById("modalTitle").innerText;
  const price = document.getElementById("modalPrice").innerText;
  const image = document.getElementById("modalImage").src;

  // double-check blocked items
  if (isBlocked(title)) {
    showCustomAlert("Maaf, menu ini hanya dapat dibeli di tempat.");
    return;
  }

  const item = { title, price, image, qty: currentQty };

  try {
    const existing = JSON.parse(localStorage.getItem("cart") || "[]");
    existing.push(item);
    localStorage.setItem("cart", JSON.stringify(existing));
    // update count badge immediately after adding
    updateCartCount();
  } catch (err) {
    console.error("Could not save to localStorage", err);
  }

  showCustomAlert(`${currentQty} × ${title} ditambahkan ke keranjang.`);
  closeModal();
  currentQty = 1;
  const qtyEl = document.getElementById("qty");
  if (qtyEl) qtyEl.innerText = currentQty;
}

function buyNow() {
  const title = document.getElementById("modalTitle").innerText;
  const price = document.getElementById("modalPrice").innerText;

  // If blocked, apologize and do not redirect to WhatsApp
  if (isBlocked(title)) {
    showCustomAlert("Maaf, menu ini hanya dapat dibeli di tempat.");
    return;
  }

  // compute numeric price and total for the selected quantity
  const priceNum = parsePriceString(price); // uses existing parser
  const lineTotal = priceNum * (currentQty || 1);
  const formattedLineTotal = formatCurrencyShort(lineTotal);

  // show quantity, title and unit price on the item line; single Total shown below
  const message = `Halo, saya ingin memesan:\n${currentQty} x ${title} - ${price}\n\nTotal: ${formattedLineTotal}\n\nSilakan konfirmasi ketersediaan dan cara pembayaran.`;
  openWhatsApp(message);
  closeModal();
  currentQty = 1;
  const qtyEl = document.getElementById("qty");
  if (qtyEl) qtyEl.innerText = currentQty;
}

function showCustomAlert(message) {
  const alertDiv = document.getElementById("customAlert");
  const alertMessage = document.getElementById("alertMessage");
  if (!alertDiv || !alertMessage) {
    alert(message);
    return;
  }

  alertMessage.innerText = message;
  alertDiv.classList.remove("alert-hidden");
  alertDiv.classList.add("alert-visible");

  setTimeout(() => {
    alertDiv.classList.remove("alert-visible");
    alertDiv.classList.add("alert-hidden");
  }, 3000);
}

// Close modal when clicking outside modal-content (works even if modal markup
// is inserted after this script runs)
document.addEventListener("click", function (e) {
  const menuModalEl = document.getElementById("menuModal");
  if (!menuModalEl) return;

  // only act when modal is visible
  const style = window.getComputedStyle(menuModalEl);
  if (style.display === "none") return;

  // if click is directly on the overlay (outside the modal content), close
  if (e.target === menuModalEl) {
    closeModal();
  }
});

// Close modal on ESC
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    closeModal();
    closeCart();
  }
});

// Contact form: open user's email client with prefilled message to jks150707@gmail.com
document.addEventListener("submit", function (e) {
  if (!e.target || e.target.id !== "contactForm") return;
  e.preventDefault();

  const name = (document.getElementById("contact-name") || {}).value || "";
  const email = (document.getElementById("contact-email") || {}).value || "";
  const phone = (document.getElementById("contact-phone") || {}).value || "";
  const message =
    (document.getElementById("contact-message") || {}).value || "";

  const to = "jks150707@gmail.com";
  const subject = `Pesan dari website Kopi-Seduh: ${name || "Tanpa nama"}`;
  const body = `Nama: ${name}\nEmail: ${email}\nNo HP: ${phone}\n\nPesan:\n${message}`;

  const mailto = `mailto:${to}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;

  // open mail client
  window.location.href = mailto;
  showCustomAlert("Membuka aplikasi email Anda...");
});

// CART: render, update, remove
function getCart() {
  try {
    return JSON.parse(localStorage.getItem("cart") || "[]");
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  try {
    localStorage.setItem("cart", JSON.stringify(cart));
  } catch (e) {
    console.error("Failed to save cart", e);
  }
}

function formatCurrency(num) {
  return "IDR " + new Intl.NumberFormat("id-ID").format(num);
}

// Short format using 'k' for thousands (e.g. 12000 -> 'IDR 12k', 12500 -> 'IDR 12.5k')
function formatCurrencyShort(num) {
  if (typeof num !== "number" || isNaN(num)) return "IDR 0";
  const k = num / 1000;
  // if an integer number of thousands, show without decimal
  if (Number.isInteger(k)) return `IDR ${k}k`;
  // otherwise show one decimal place (e.g. 12.5k)
  const rounded = Math.round(k * 10) / 10;
  return `IDR ${rounded}k`;
}

function parsePriceString(priceStr) {
  if (!priceStr) return 0;
  const s = String(priceStr).toLowerCase().trim();

  // handle shorthand like '12k' or '12.5k' (k -> *1000)
  const kMatch = s.match(/([\d.,]+)\s*k/);
  if (kMatch) {
    const numStr = kMatch[1].replace(/,/g, ".");
    const val = parseFloat(numStr);
    if (!isNaN(val)) return Math.round(val * 1000);
  }

  // handle formatted numbers like 'IDR 12.000' or '12000'
  const digits = s.replace(/[^\d]/g, "");
  return digits ? parseInt(digits, 10) : 0;
}

function updateCartCount() {
  const cart = getCart();
  const totalQty = cart.reduce((s, it) => s + (it.qty || 0), 0);
  const badge = document.getElementById("cartCount");
  if (badge) {
    badge.innerText = totalQty;
    badge.style.display = totalQty > 0 ? "inline-block" : "none";
  }
}

function openCart(e) {
  if (e) e.preventDefault();
  const cartModal = document.getElementById("cartModal");
  if (!cartModal) return;
  cartModal.classList.add("open");
  document.body.classList.add("noscroll");
  renderCart();
}

function closeCart() {
  const cartModal = document.getElementById("cartModal");
  if (!cartModal) return;
  cartModal.classList.remove("open");
  document.body.classList.remove("noscroll");
}

function renderCart() {
  const cart = getCart();
  const container = document.getElementById("cartItems");
  const totalEl = document.getElementById("cartTotal");
  if (!container || !totalEl) return;

  if (cart.length === 0) {
    container.innerHTML = '<p style="opacity:.8">Keranjang kosong.</p>';
    totalEl.innerText = "Total: IDR 0";
    updateCartCount();
    return;
  }

  let total = 0;
  container.innerHTML = cart
    .map((it, idx) => {
      const priceNum = parsePriceString(it.price);
      const lineTotal = priceNum * (it.qty || 1);
      total += lineTotal;
      const formattedUnit = formatCurrencyShort(priceNum);
      return `
        <div class="cart-item">
          <img src="${it.image}" alt="${it.title}" />
          <div class="item-info">
            <div class="item-title">${it.title}</div>
            <div class="item-price">${formattedUnit} × ${it.qty}</div>
          </div>
          <div class="item-actions">
            <button class="qty-btn" onclick="event.stopPropagation(); changeCartItemQty(${idx}, -1)">-</button>
            <button class="qty-btn" onclick="event.stopPropagation(); changeCartItemQty(${idx}, 1)">+</button>
          </div>
          <div class="item-delete">
            <button class="delete-btn" onclick="event.stopPropagation(); removeCartItem(${idx})">Hapus</button>
          </div>
        </div>
      `;
    })
    .join("");

  totalEl.innerText = "Total: " + formatCurrencyShort(total);
  updateCartCount();
}

function changeCartItemQty(index, delta) {
  const cart = getCart();
  if (!cart[index]) return;
  cart[index].qty = Math.max(1, (cart[index].qty || 1) + delta);
  saveCart(cart);
  renderCart();
}

function removeCartItem(index) {
  const cart = getCart();
  if (!cart[index]) return;
  cart.splice(index, 1);
  saveCart(cart);
  renderCart();
  showCustomAlert("Item dihapus dari keranjang");
}

function clearCart() {
  saveCart([]);
  renderCart();
  showCustomAlert("Keranjang dibersihkan");
  updateCartCount();
  // close cart after clearing
  setTimeout(() => closeCart(), 500);
}

function checkout() {
  const cart = getCart();
  if (!cart || cart.length === 0) {
    showCustomAlert("Keranjang kosong");
    return;
  }
  // Build cart summary for WhatsApp
  let total = 0;
  const lines = cart.map((it) => {
    const priceNum = parsePriceString(it.price);
    const lineTotal = priceNum * (it.qty || 1);
    total += lineTotal;
    // show qty, title and unit price on the item line; total only at bottom
    return `${it.qty} x ${it.title} - ${it.price}`;
  });

  const message = `Halo, saya ingin memesan:\n${lines.join(
    "\n"
  )}\n\nTotal: ${formatCurrencyShort(
    total
  )}\n\nSilakan konfirmasi ketersediaan dan pengiriman.`;
  openWhatsApp(message);
  // clear the cart after sending order and close sidebar
  clearCart();
}

// wire cart icon
const shoppingCartBtn = document.getElementById("shopping-cart");
if (shoppingCartBtn) shoppingCartBtn.addEventListener("click", openCart);

// ensure count is shown on load
updateCartCount();

// Close cart when clicking outside the cart-panel
document.addEventListener("click", function (e) {
  const cartModal = document.getElementById("cartModal");
  const cartPanel = document.querySelector(".cart-panel");
  const cartBtn = document.getElementById("shopping-cart");
  if (!cartModal || !cartModal.classList.contains("open")) return;

  // if click is inside panel or on the cart button, do nothing
  if (cartPanel && cartPanel.contains(e.target)) return;
  if (cartBtn && cartBtn.contains(e.target)) return;

  // otherwise close the cart
  closeCart();
});


let orderItem = "";
let orderPrice = "";
let orderQty = 1;

function buyNow() {
  document.getElementById("userDataModal").style.display = "flex";

  orderItem = document.getElementById("modalTitle").innerText;
  orderPrice = document.getElementById("modalPrice").innerText;
  orderQty = parseInt(document.getElementById("qty").innerText);
}

function closeUserData() {
  document.getElementById("userDataModal").style.display = "none";
}

function sendToWa() {
  const name = document.getElementById("orderName").value.trim();
  const address = document.getElementById("orderAddress").value.trim();

  if (name === "" || address === "") {
    alert("Nama dan alamat wajib diisi!");
    return;
  }

  let priceNum = parseInt(orderPrice.replace("IDR", "").replace("k", "")) * 1000;
  let total = priceNum * orderQty;

  let message = `
Halo Kak, saya ingin memesan:

🛒 *${orderItem}*
Jumlah: *${orderQty}*
Harga: ${orderPrice}
Total: *IDR ${total}*

📌 *Data Pemesan*
Nama: ${name}
Alamat: ${address}
  `.trim();

  let waURL = "https://wa.me/6281234567890?text=" + encodeURIComponent(message);
  window.open(waURL, "_blank");
}

