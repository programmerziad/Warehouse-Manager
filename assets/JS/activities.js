let allActivities = [];

function getActivities() {
    allActivities = JSON.parse(localStorage.getItem("activities")) || [];
    return allActivities;
}

function formatTime(date) {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);

    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins} ${mins === 1 ? "min" : "mins"} ago`;

    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;

    const days = Math.floor(hours / 24);
    return `${days} ${days === 1 ? "day" : "days"} ago`;
}

function renderActivities(filter = "all") {
    const list = document.getElementById("activitiesList");
    if (!list) return; // حماية لو العنصر مش موجود

    let activities = getActivities();

    // تطبيق الفلترة
    if (filter !== "all") {
        activities = activities.filter(a => a.icon === filter);
    }

    list.innerHTML = "";

    if (activities.length === 0) {
        list.innerHTML = `
            <div class="no-activities" style="text-align:center; padding: 40px; color: #9ca3af;">
                <span class="material-symbols-outlined" style="font-size: 48px; opacity: 0.5;">history_toggle_off</span>
                <p style="margin-top: 10px;">No activities to show for this filter.</p>
            </div>`;
        return;
    }

    // استخدام DocumentFragment لتحسين الأداء عند الرسم
    const fragment = document.createDocumentFragment();

    activities.forEach(act => {
        const article = document.createElement("article");
        article.className = "activities-page-item";

        article.innerHTML = `
            <div class="activity-left">
                <div class="activity-icon">
                    <span class="material-symbols-outlined">${act.icon || 'notifications'}</span>
                </div>
                <div class="activity-text">
                    <p class="activity-title">${act.text}</p>
                    <p class="activity-meta">${act.meta || ""}</p>
                </div>
            </div>
            <div class="activity-time">${formatTime(act.time)}</div>
        `;
        fragment.appendChild(article);
    });

    list.appendChild(fragment);
}

// تشغيل الفلاتر
document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        // إزالة النشاط من كل الزراير وإضافته للمضغطوط عليه
        document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        renderActivities(btn.dataset.filter);
    });
});

// تشغيل عند التحميل
document.addEventListener("DOMContentLoaded", () => renderActivities());



// تعريف العناصر
const clearLogsBtn = document.getElementById("clearLogsBtn");
const clearLogsModal = document.getElementById("clearLogsModal");
const confirmClearBtn = document.getElementById("confirmClearBtn");
const cancelClearBtn = document.getElementById("cancelClearBtn");

// فتح المودال عند الضغط على الزر
if (clearLogsBtn) {
    clearLogsBtn.onclick = () => {
        clearLogsModal.style.display = "flex";
    };
}

// إغلاق المودال عند الضغط على Cancel
if (cancelClearBtn) {
    cancelClearBtn.onclick = () => {
        clearLogsModal.style.display = "none";
    };
}

// تنفيذ عملية المسح عند التأكيد
if (confirmClearBtn) {
    confirmClearBtn.onclick = () => {
        // 1. مسح مصفوفة النشاطات من التخزين
        localStorage.removeItem("activities");

        clearLogsModal.style.display = "none";

        if (typeof renderActivities === "function") {
            renderActivities();
        } else {
            location.reload();
        }
        
    };
}