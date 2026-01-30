// ================== DOM Elements ==================
// تعريف العناصر الأساسية مرة واحدة في البداية
const logoutBtn = document.getElementById("logoutBtn");
const popup = document.getElementById("logoutPopup");
const btnYes = document.getElementById("confirmYes");
const btnNo = document.getElementById("confirmNo");
const displayGreeting = document.getElementById("time-Edite");
const nameHolder = document.getElementById("info-Name");
const tableBody = document.getElementById("productsTableBody");
const filterRadios = document.querySelectorAll('input[name="filters"]');
const searchInput = document.getElementById("searchInput");

// تعريف عناصر الإضافة (كانت ناقصة في الكود الأصلي)
const addProductBtn = document.getElementById("addProductBtn");
const productNameInput = document.getElementById("productName");
const productCategoryInput = document.getElementById("productCategory");
const productQuantityInput = document.getElementById("productQuantity");
const productPriceInput = document.getElementById("productPrice");
const productExpiryInput = document.getElementById("productExpiry");
const messagePopup = document.getElementById("messagePopup"); // افترضت وجوده

// ================== Data Management ==================
function getProducts() {
    return JSON.parse(localStorage.getItem("products")) || [];
}

function saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
}

// ================== Greeting & User Info ==================
// تحسين: تشغيل الكود فوراً بدون الانتظار
(function initDashboard() {
    const hour = new Date().getHours();
    let message = hour < 12 ? "GOOD MORNING" : hour < 18 ? "GOOD AFTERNOON" : "GOOD NIGHT";
    
    if (displayGreeting) displayGreeting.innerHTML = message;

    const dashboardName = localStorage.getItem("dashboardNameUser") || "User";
    if (nameHolder) nameHolder.innerHTML = `<span class="nameHold">Admin:</span> ${dashboardName}`;
})();

// ================== Logout Logic ==================
if (logoutBtn) {
    logoutBtn.onclick = (e) => {
        e.preventDefault();
        popup.style.display = "flex";
    };
}

if (btnYes) {
    btnYes.addEventListener("click", () => {
        localStorage.clear();
        popup.innerHTML = `<p class="popupLogout">Logout Successful ✅</p>`;
        setTimeout(() => window.location.href = "index.html", 2000);
    });
}

if (btnNo) {
    btnNo.addEventListener("click", () => popup.style.display = "none");
}

// ================== Product Logic ==================

function getStatus(product) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = product.expiryDate ? new Date(product.expiryDate) : null;

    // 1. الأولوية للأمان: منتهي الصلاحية
    if (expiry && expiry < today) {
        return { text: "Expired", class: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-400" };
    }
    
    // 2. نفاد الكمية
    if (product.quantity <= 0) {
        return { text: "Out of Stock", class: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300" };
    }

    // 3. اقتراب انتهاء الصلاحية
    if (expiry && (expiry - today) <= EXPIRY_DAYS * Day) {
        return { text: "Expiring Soon", class: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" };
    }

    // 4. كمية قليلة
    if (product.quantity <= Low_stock_Limit) {
        return { text: "Low Stock", class: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" };
    }

    return { text: "In Stock", class: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" };
}

function highlightText(text, searchTerm) {
    if (!searchTerm) return text;
    // حماية بسيطة ضد XSS قبل التمييز
    const safeText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const regex = new RegExp(`(${searchTerm})`, "gi");
    return safeText.replace(regex, `<span class="text-blue-600 dark:text-blue-400 font-semibold">$1</span>`);
}

// دالة العرض الرئيسية (تجمع البحث والفلترة)
function renderProducts() {
    const products = getProducts();
    const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : "";
    // الحصول على الفلتر المختار
    const activeFilter = document.querySelector('input[name="filters"]:checked')?.value || "All";

    tableBody.innerHTML = "";

    // 1. الفلترة والبحث مع بعض
    let filteredProducts = products.filter(product => {
        const status = getStatus(product).text;
        
        const matchesFilter = (activeFilter === "All") || (status === activeFilter);
        
        const matchesSearch = product.name.toLowerCase().includes(searchTerm);

        return matchesFilter && matchesSearch;
    });

    // 2. الترتيب (الأحدث أولاً)
    filteredProducts.sort((a, b) => b.id - a.id);

    // 3. حالة عدم وجود نتائج
    if (filteredProducts.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" class="px-6 py-6 text-center text-gray-500">No products found</td></tr>`;
        return;
    }

    // 4. الرسم (HTML Generation)
    filteredProducts.forEach(product => {
        const status = getStatus(product);
        const row = document.createElement("tr");
        row.className = "bg-white dark:bg-gray-900/50 border-b dark:border-gray-800";

        // استخدام highlightText فقط عند العرض
        const displayName = highlightText(product.name, searchTerm);

        row.innerHTML = `
          <td class="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">${displayName}</td>
          <td class="px-6 py-4 text-center">${product.quantity}</td>
          <td class="px-6 py-4 text-center">${product.price.toFixed(2)} EGP</td>
          <td class="px-6 py-4">${product.expiryDate || "-"}</td>
          <td class="px-6 py-4">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.class}">
              ${status.text}
            </span>
          </td>
          <td class="px-6 py-4 text-right space-x-2">
            <button class="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500" onclick="editProduct(${product.id})">
              <span class="material-symbols-outlined text-base">edit</span>
            </button>
            <button class="delet-product p-2 rounded-md text-red-500" onclick="deleteProduct(${product.id})">
              <span class="material-symbols-outlined text-base">delete</span>
            </button>
          </td>
        `;
        tableBody.appendChild(row);
    });
}

// ================== Event Listeners ==================

// تغيير الفلتر يعيد الرسم
filterRadios.forEach(radio => {
    radio.addEventListener('change', renderProducts);
});

// الكتابة في البحث تعيد الرسم
if (searchInput) {
    searchInput.addEventListener("input", renderProducts);
}

// تحميل الصفحة
document.addEventListener("DOMContentLoaded", renderProducts);

// ================== Actions (Delete & Add) ==================
// 1. متغير عالمي لحفظ الـ ID مؤقتاً
let productToDeleteId = null; 

window.deleteProduct = function(id) {
    const modal = document.getElementById("deleteModal");
    productToDeleteId = id;
    if (modal) modal.style.display = "flex"; 
};


document.getElementById("cancelDelete").onclick = function() {
    document.getElementById("deleteModal").style.display = "none";
    productToDeleteId = null;
};

function showToast(message) {
    const toast = document.getElementById("successToast");
    const toastMsg = document.getElementById("toastMessage");
    
    if (toast && toastMsg) {
        toastMsg.textContent = message;
        toast.style.display = "block";

      
        setTimeout(() => {
            toast.style.display = "none";
        }, 6000);
    }
}

document.getElementById("confirmDelete").onclick = function() {
    if (productToDeleteId) {
        // جلب البيانات الحالية
        let products = typeof getProducts === "function" ? getProducts() : JSON.parse(localStorage.getItem("products")) || [];
        
      
        const productInfo = products.find(p => p.id === productToDeleteId);
        const productName = productInfo ? productInfo.name : 'Unknown';

      
        const updatedProducts = products.filter((p) => p.id !== productToDeleteId);
        
        
        if (typeof saveProducts === "function") {
            saveProducts(updatedProducts);
        } else {
            localStorage.setItem("products", JSON.stringify(updatedProducts));
        }

        if (typeof renderProducts === "function") renderProducts();

        document.getElementById("deleteModal").style.display = "none";

    
        showToast(`Product "${productName}" has been deleted successfully.`);


        productToDeleteId = null;
    }
};


// ================== Edit Product Logic ==================

window.editProduct = function(id) {

    const products = typeof getProducts === "function" ? getProducts() : JSON.parse(localStorage.getItem("products")) || [];
    
    
    const productToEdit = products.find(p => p.id === id);

    if (productToEdit) {
    

        localStorage.setItem("currentEditProduct", JSON.stringify(productToEdit));


        showToast(`Opening editor for "${productToEdit.name}"...`);

        setTimeout(() => {
            window.location.href = "add_product_page.html?mode=edit"; 

          }, 1500);
    } else {
        showToast("Error: Product not found!");
    }
};

// إضافة منتج
if (addProductBtn) {
    addProductBtn.addEventListener("click", function () {
        const name = productNameInput.value.trim();
        const category = productCategoryInput.value;
        const quantity = Number(productQuantityInput.value);
        const price = Number(productPriceInput.value);
        const expiryDate = productExpiryInput.value;

        // Validation
        if (!name || !category || quantity < 0 || price <= 0) {
            alert("Please fill all fields correctly.");
            return;
        }

        const newProduct = {
            id: Date.now(),
            name,
            category,
            quantity,
            price,
            expiryDate
        };

        const products = getProducts();
        products.push(newProduct);
        saveProducts(products);

        // Reset Form
        productNameInput.value = "";
        productCategoryInput.value = "";
        productQuantityInput.value = "";
        productPriceInput.value = "";
        productExpiryInput.value = "";
        
        // Success Message
        if(messagePopup) {
            messagePopup.classList.add("active");
            setTimeout(() => messagePopup.classList.remove("active"), 3000);
        }

        renderProducts();
    });
}