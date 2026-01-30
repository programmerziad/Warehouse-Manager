document.addEventListener("DOMContentLoaded", function () {
  const tableBody = document.querySelector(".products-table tbody");
  const searchInput = document.getElementById("searchInput");
  const categorySelect = document.querySelector(".category-select");

  const toastContainer = document.createElement("div");
  toastContainer.id = "toast-container";
  document.body.appendChild(toastContainer);

  // --- Helpers ---
  function getProducts() {
    return JSON.parse(localStorage.getItem("products")) || [];
  }

  function saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }

  // دالة التلوين الخاصة بك (المعدلة للحماية)
  function highlightText(text, searchTerm) {
    if (!searchTerm) return text;
    const safeText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const regex = new RegExp(`(${searchTerm})`, "gi");
    // بتستخدم كلاسات Tailwind اللي إنت بعتها
    return safeText.replace(
      regex,
      `<span class="text-blue-600 dark:text-blue-400 font-semibold">$1</span>`
    );
  }

  function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerText = message;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.classList.add("show"), 100);
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  function logActivity(productName, quantity, currentStock) {
    const activities = JSON.parse(localStorage.getItem("activities")) || [];
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB'); 
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    const newActivity = {
        id: Date.now(),
        // النص مع تلوين الاسم
        text: `${quantity} units of <span style="color: #2563eb; font-weight: 600;">${productName}</span> were withdrawn.`,
        // المتاح مع تلوين أخضر
        meta: `<span style="color: #059669; font-weight: 600;">Available: ${currentStock}</span> | ${dateStr} | ${timeStr}`, 
        time: now.toISOString(),
        icon: "trending_down",
        type: 'stock_out'
    };

    activities.unshift(newActivity);
    localStorage.setItem("activities", JSON.stringify(activities));
}

  // --- الدالة الأساسية للعرض ---
  function renderStockOutTable() {
    const products = getProducts();
    const searchTerm = searchInput.value.trim(); // بناخد القيمة اللي في السيرش
    const selectedCategory = categorySelect.value;

    tableBody.innerHTML = "";

    // الفلترة
    let filteredProducts = products.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "All Categories" ||
        product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    filteredProducts.sort((a, b) => b.id - a.id);

    if (filteredProducts.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No products found.</td></tr>`;
      return;
    }

    filteredProducts.forEach((product) => {
      const row = document.createElement("tr");

      // استدعاء دالة التلوين بتاعتك هنا
      const highlightedName = highlightText(product.name, searchTerm);

      row.innerHTML = `
                <td>${highlightedName}</td>
                <td>${product.category}</td>
                <td><span class="stock-badge">${product.quantity}</span></td>
                <td><input class="qty-input" type="number" min="1" placeholder="Qty"></td>
                <td><button class="btn-confirm" data-id="${product.id}">Confirm</button></td>
            `;
      tableBody.appendChild(row);
    });
  }

  // --- Events ---
  searchInput.addEventListener("input", renderStockOutTable);
  categorySelect.addEventListener("change", renderStockOutTable);

  tableBody.addEventListener("click", function (e) {
    if (e.target.classList.contains("btn-confirm")) {
      const btn = e.target;
      const id = Number(btn.dataset.id);
      const row = btn.closest("tr");
      const input = row.querySelector(".qty-input");
      const qty = Number(input.value);

      const products = getProducts();
      const product = products.find((p) => p.id === id);

      if (!input.value || qty <= 0 || !product || qty > product.quantity) {
        const msg = !product
          ? "Product not found!"
          : qty > product.quantity
          ? `Low stock! Available: ${product.quantity}`
          : "Please enter a valid quantity!";
        showToast(msg, "error");
        return;
      }

      product.quantity -= qty;
      saveProducts(products);
      
      logActivity(product.name, qty, product.quantity);

      renderStockOutTable();
      showToast(`Successfully removed ${qty} from ${product.name}`, "success");
    }
  });

  renderStockOutTable();
});
