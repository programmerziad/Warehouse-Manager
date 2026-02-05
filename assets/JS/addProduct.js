// ================== DOM Elements & UI ==================
const logoutBtn = document.getElementById("logoutBtn");
const popup = document.getElementById("logoutPopup");
const btnYes = document.getElementById("confirmYes");
const btnNo = document.getElementById("confirmNo");
const displayGreeting = document.getElementById("time-Edite");
const nameHolder = document.getElementById("info-Name");

const productNameInput = document.getElementById("product-name");
const productCategoryInput = document.getElementById("category");
const productQuantityInput = document.getElementById("quantity");
const productPriceInput = document.getElementById("price");
const productExpiryInput = document.getElementById("expiry-date");
const addProductBtn = document.getElementById("addProductBtn");

const messagePopup = document.getElementById("messagePopup");
const addedPopup = document.getElementById("addedPopup");
const closeAddedPopup = document.getElementById("closeAddedPopup");

// فحص وضع التعديل
const urlParams = new URLSearchParams(window.location.search);
const isEditMode = urlParams.get("mode") === "edit";
let currentEditProduct = JSON.parse(localStorage.getItem("currentEditProduct"));

// ================== Logout & Greeting ==================
if (logoutBtn) {
  logoutBtn.onclick = (e) => {
    e.preventDefault();
    popup.style.display = "flex";
  };
}
if (btnNo) btnNo.onclick = () => (popup.style.display = "none");
if (btnYes) {
  btnYes.onclick = () => {
    localStorage.removeItem("savedUser");
    popup.innerHTML = `<p class="popupLogout">Logout Successful ✅</p>`;
    setTimeout(() => (window.location.href = "index.html"), 1500);
  };
}

const hour = new Date().getHours();
if (displayGreeting) {
  displayGreeting.innerHTML =
    hour < 12 ? "GOOD MORNING" : hour < 18 ? "GOOD AFTERNOON" : "GOOD NIGHT";
}
if (nameHolder) {
  nameHolder.innerHTML = `<span class="nameHold">Admin:</span> ${
    localStorage.getItem("dashboardNameUser") || "Admin"
  }`;
}

// ================== Core Functions ==================
function getProducts() {
  return JSON.parse(localStorage.getItem("products")) || [];
}
function saveProducts(products) {
  localStorage.setItem("products", JSON.stringify(products));
}

function addActivity(text, meta = "", icon = "add") {
  let activities = JSON.parse(localStorage.getItem("activities")) || [];
  activities.unshift({ text, meta, icon, time: new Date().toISOString() });
  localStorage.setItem("activities", JSON.stringify(activities.slice(0, 50)));
}

// ================== Initialize Edit Mode ==================
if (isEditMode && currentEditProduct) {
  // تعبئة الحقول بالبيانات المخزنة
  productNameInput.value = currentEditProduct.name;
  productCategoryInput.value = currentEditProduct.category;
  productQuantityInput.value = currentEditProduct.quantity;
  productPriceInput.value = currentEditProduct.price;
  productExpiryInput.value = currentEditProduct.expiryDate;

  // تغيير نصوص الواجهة
  const title = document.querySelector(".page-title");
  if (title) title.textContent = "Edit Product";
  if (addProductBtn) addProductBtn.textContent = "Update Product";

  // تعديل الـ Breadcrumb (المسار الصغير في الأعلى)
  const breadcrumb = document.querySelector("span.text-white");
  if (breadcrumb) breadcrumb.textContent = "Edit Product";
}

// ================== Add / Update Event ==================
if (addProductBtn) {
  addProductBtn.addEventListener("click", function () {
    const name = productNameInput.value.trim();
    const category = productCategoryInput.value;
    const quantity = productQuantityInput.value;
    const price = productPriceInput.value;
    const expiryDate = productExpiryInput.value;

    // التحقق من الحقول
    if (!name || !category || !quantity || !price || !expiryDate) {
      messagePopup.classList.add("active");
      setTimeout(() => messagePopup.classList.remove("active"), 3000);
      return;
    }

    let products = getProducts();

    // تعريف الوقت الحالي وتنسيقه بشكل أنيق
    const now = new Date();
    const dateString = now.toLocaleDateString("en-GB"); // مثال: 20/01/2026
    const timeString = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }); // مثال: 03:55 PM
    const dateTimeFormatted = `on ${dateString} at ${timeString}`;

    if (isEditMode) {
      // منطق التعديل: استبدال المنتج القديم بنفس الـ ID
      const index = products.findIndex((p) => p.id === currentEditProduct.id);
      if (index !== -1) {
        products[index] = {
          id: currentEditProduct.id,
          name,
          category,
          quantity: Number(quantity),
          price: Number(price),
          expiryDate,
        };

        // سجل النشاط عند التعديل مع التاريخ والوقت
        addActivity(
          `Updated product: <span style="color: #137fec;">${name}</span>`,
          `Modified ${dateTimeFormatted}`,
          "edit"
        );
      }
    } else {
    
      const newProduct = {
        id: Date.now(),
        name,
        category,
        quantity: Number(quantity),
        price: Number(price),
        expiryDate,
      };
      products.push(newProduct);

      // سجل النشاط عند الإضافة مع التاريخ والوقت
      addActivity(
        `New product added: <span style="color: #137fec;">${name}</span>`,
        `Added ${dateTimeFormatted}`,
        "add"
      );
    }

    saveProducts(products);

    const successTitle = addedPopup.querySelector("h2");
    if (isEditMode && successTitle)
      successTitle.textContent = "Product Updated Successfully!";

    addedPopup.classList.add("active");
  });
}

if (closeAddedPopup) {
  closeAddedPopup.onclick = () => {
    localStorage.removeItem("currentEditProduct");
    window.location.href = "products_page.html";
  };
}
