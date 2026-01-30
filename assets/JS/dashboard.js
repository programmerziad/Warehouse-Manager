// ======================================================
// 1. الثيم (Dark Mode) - تنفيذ فوري لمنع الوميض
// ======================================================
(function () {
    const html = document.documentElement;
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
        html.classList.add("dark");
    }

    window.updateThemeIcons = function() {
        const isDark = html.classList.contains("dark");
        document.querySelectorAll(".dark-mode-icon").forEach(el => el.style.display = isDark ? "none" : "inline");
        document.querySelectorAll(".light-mode-icon").forEach(el => el.style.display = isDark ? "inline" : "none");
    };
})();

// ======================================================
// 2. العناصر الأساسية (DOM Elements)
// ======================================================
const elements = {
    logoutBtn: document.getElementById("logoutBtn"),
    logoutPopup: document.getElementById("logoutPopup"),
    btnYes: document.getElementById("confirmYes"),
    btnNo: document.getElementById("confirmNo"),
    displayGreeting: document.getElementById("time-Edite"),
    nameHolder: document.getElementById("info-Name"),
    themeToggle: document.getElementById("themeToggle"),
    activitiesList: document.getElementById("activitiesList")
};

// ======================================================
// 3. إدارة البيانات (Storage)
// ======================================================
const storage = {
    getProducts: () => JSON.parse(localStorage.getItem("products")) || [],
    getActivities: () => JSON.parse(localStorage.getItem("activities")) || [],
    saveActivities: (data) => localStorage.setItem("activities", JSON.stringify(data.slice(0, 50)))
};

// ======================================================
// 4. الترحيب والوقت (Greeting Logic)
// ======================================================
function initGreeting() {
    const hour = new Date().getHours();
    let message = "";

    if (hour >= 5 && hour < 12) message = "GOOD MORNING";
    else if (hour >= 12 && hour < 18) message = "GOOD AFTERNOON";
    else message = "GOOD NIGHT";

    if (elements.displayGreeting) elements.displayGreeting.textContent = message;
    
    const dashboardName = localStorage.getItem("dashboardNameUser") || "Admin";
    if (elements.nameHolder) {
        elements.nameHolder.innerHTML = `<span class="nameHold">Admin:</span> ${dashboardName}`;
    }
}

// ======================================================
// 5. الإحصائيات والتنبيهات (Dashboard Logic)
// ======================================================
function loadStats() {
    const products = storage.getProducts();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = {
        total: products.length,
        lowStock: products.filter(p => p.quantity <= Low_stock_Limit).length,
        expired: products.filter(p => p.expiryDate && new Date(p.expiryDate) < today).length,
        expiring: products.filter(p => {
            if (!p.expiryDate) return false;
            const diff = (new Date(p.expiryDate) - today) / Day;
            return diff >= 0 && diff <= EXPIRY_DAYS;
        }).length
    };

    const map = { totalProducts: stats.total, lowStock: stats.lowStock, expiring: stats.expiring, expired: stats.expired };
    for (let id in map) {
        const el = document.getElementById(id);
        if (el) el.textContent = map[id];
    }
}

function autoWarnings() {
    const products = storage.getProducts();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    products.forEach(p => {
        if (p.quantity <= Low_stock_Limit) saveAuto(`Stock low: ${p.name}`, `Only ${p.quantity} left`, "warning");
        
        if (p.expiryDate) {
            const diff = (new Date(p.expiryDate) - today) / Day;
            if (diff <= EXPIRY_DAYS && diff >= 0) saveAuto(`Expiring soon: ${p.name}`, `Expires in ${Math.ceil(diff)} days`, "calendar_today");
            else if (diff < 0) saveAuto(`Expired product: ${p.name}`, "Remove from stock", "error");
        }
    });
}

function saveAuto(text, meta, icon) {
    let activities = storage.getActivities();
    // تجنب التكرار في نفس اليوم
    const exists = activities.some(a => a.text === text && new Date(a.time).toDateString() === new Date().toDateString());
    if (exists) return;

    activities.unshift({ text, meta, icon, time: new Date().toISOString() });
    storage.saveActivities(activities);
}

// ======================================================
// 6. عرض الأنشطة وتنسيق الوقت (UI Display)
// ======================================================
function formatTime(date) {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins} min ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hour ago`;
    return `${Math.floor(hours / 24)} day ago`;
}

function loadActivities(limit = 4) {
    if (!elements.activitiesList) return;
    const activities = storage.getActivities();
    elements.activitiesList.innerHTML = "";

    if (activities.length === 0) {
        elements.activitiesList.innerHTML = `<div class="no-activities" style="text-align:center; padding:20px; color:#6b7280;">
            <span class="material-symbols-outlined" style="font-size:40px; color:#d1d5db;">warning</span>
            <p>No recent activities.</p></div>`;
        return;
    }

    activities.slice(0, limit).forEach(act => {
        const article = document.createElement("article");
        article.className = "activity";
        article.innerHTML = `
            <div class="activity-left">
                <div class="activity-icon"><span class="material-symbols-outlined">${act.icon}</span></div>
                <div class="activity-text">
                    <p class="activity-title">${act.text}</p>
                    <p class="activity-meta">${act.meta || ""}</p>
                </div>
            </div>
            <div class="activity-time">${formatTime(act.time)}</div>`;
        elements.activitiesList.appendChild(article);
    });
}

// ======================================================
// 7. الأحداث (Event Listeners)
// ======================================================

// Dark Mode Toggle
if (elements.themeToggle) {
    elements.themeToggle.addEventListener("click", () => {
        const isDark = document.documentElement.classList.toggle("dark");
        localStorage.setItem("theme", isDark ? "dark" : "light");
        updateThemeIcons();
    });
}

// Logout Logic
if (elements.logoutBtn) {
    elements.logoutBtn.onclick = (e) => {
        e.preventDefault();
        elements.logoutPopup.style.display = "flex";
    };
}

if (elements.btnNo) {
    elements.btnNo.onclick = () => elements.logoutPopup.style.display = "none";
}

if (elements.btnYes) {
    elements.btnYes.onclick = () => {
        localStorage.removeItem("savedUser");
        localStorage.removeItem("savedPass");
        localStorage.removeItem("dashboardNameUser");
        elements.logoutPopup.innerHTML = `<p class="popupLogout">Logout Successful ✅</p>`;
        setTimeout(() => window.location.href = "index.html", 1500);
    };
}

// ======================================================
// 8. التشغيل عند التحميل (Initialization)
// ======================================================
document.addEventListener("DOMContentLoaded", () => {
    updateThemeIcons();
    initGreeting();
    autoWarnings();
    loadStats();
    loadActivities(4);
});


// ======================================================
const sidebar = document.getElementById('sidebar');
const menuBtn = document.getElementById('menuOpenBtn');

if(menuBtn) {
    menuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });
}

// إغلاق السايد بار عند الضغط في أي مكان خارجه (للموبايل)
document.addEventListener('click', (e) => {
    if (window.innerWidth <= 450) {
        if (!sidebar.contains(e.target) && !menuBtn.contains(e.target)) {
            sidebar.classList.remove('open');
        }
    }
});