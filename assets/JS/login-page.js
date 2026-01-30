// ======================================================
// 1. تعريف العناصر
// ======================================================
const userInput = document.getElementById("user-name");
const passInput = document.getElementById("user-password");
const loginBtn = document.getElementById("loginBtn");

// جلب رسائل الخطأ بأمان
const usernameError = userInput?.closest("label")?.querySelector(".error-message");
const passwordError = passInput?.closest("label")?.querySelector(".error-message");

// ======================================================
// 2. إدارة حالة الزر (Enable/Disable)
// ======================================================
function toggleButton() {
    if (userInput.value.trim() && passInput.value.trim()) {
        loginBtn.classList.remove("disabled");
        loginBtn.disabled = false;
    } else {
        loginBtn.classList.add("disabled");
        loginBtn.disabled = true;
    }
}

// تحديث الزر فور الكتابة
[userInput, passInput].forEach((input) => {
    input.addEventListener("input", () => {
        toggleButton();
        loginBtn.textContent = "Login";
        loginBtn.classList.remove("error", "success");
    });
});

// تفعيل الفحص لأول مرة عند تحميل الصفحة
toggleButton();

// ======================================================
// 3. منطق تسجيل الدخول
// ======================================================
loginBtn.onclick = function (event) {
    event.preventDefault();

    let enteredUser = userInput.value.trim();
    let enteredPass = passInput.value.trim();

    // تصفير الأخطاء السابقة
    if (usernameError) usernameError.textContent = "";
    if (passwordError) passwordError.textContent = "";

    const savedUser = localStorage.getItem("savedUser");
    const savedPass = localStorage.getItem("savedPass");

    // أ- الحالة الأولى: تسجيل مستخدم جديد (لأول مرة)
    if (!savedUser && !savedPass) {
        localStorage.setItem("savedUser", enteredUser);
        localStorage.setItem("savedPass", enteredPass);
        handleLoginSuccess(enteredUser);
        return;
    }

    // ب- الحالة الثانية: التحقق من بيانات المستخدم المسجل
    if (enteredUser === savedUser && enteredPass === savedPass) {
        handleLoginSuccess(enteredUser);
    } 
    else {
        handleLoginError();
    }
};

// ======================================================
// 4. وظائف المساعدة (Helpers)
// ======================================================

function handleLoginSuccess(userName) {
    // حفظ الاسم لعرضه في لوحة التحكم (Dashboard)
    localStorage.setItem("dashboardNameUser", userName);

    loginBtn.textContent = "Login Successful ✅";
    loginBtn.classList.add("success");
    loginBtn.classList.remove("error");

    setTimeout(() => {
        window.location.href = "Dashboard.html";
    }, 1500);
}

function handleLoginError() {
    if (passwordError) {
        passwordError.textContent = "Incorrect username or password";
        passwordError.classList.add("active");
    }

    loginBtn.classList.add("shake", "error");
    loginBtn.textContent = "Incorrect credentials ⚠";

    // إزالة تأثير الاهتزاز (Shake) سريعاً
    setTimeout(() => loginBtn.classList.remove("shake"), 300);

    // إعادة الزر لحالته الطبيعية بعد ثانيتين
    setTimeout(() => {
        loginBtn.textContent = "Login";
        loginBtn.classList.remove("error");
    }, 2000);
}