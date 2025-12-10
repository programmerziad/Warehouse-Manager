const userInput = document.getElementById("user-name");
const passInput = document.getElementById("user-password");
const loginBtn = document.getElementById("loginBtn");

// رسائل الخطأ تحت كل انبوت
const usernameError = userInput.closest("label").querySelector(".error-message");
const passwordError = passInput.closest("label").querySelector(".error-message");

// وظيفة تمكين/تعطيل الزر
function toggleButton() {
    if (userInput.value.trim() && passInput.value.trim()) {
        loginBtn.classList.remove("disabled");
        loginBtn.removeAttribute("disabled");
    } else {
        loginBtn.classList.add("disabled");
        loginBtn.setAttribute("disabled", "true");
    }
}

// تحديث الزر بمجرد كتابة المستخدم
[userInput, passInput].forEach((input) => {
    input.addEventListener("input", () => {
        toggleButton();
        loginBtn.textContent = "Login";
        loginBtn.classList.remove("error", "success");
    });
});

// تفعيل أول مرة
toggleButton();

loginBtn.onclick = function (event) {
    event.preventDefault();

    let enteredUser = userInput.value.trim();
    let enteredPass = passInput.value.trim();

    // Reset errors
    usernameError.textContent = "";
    passwordError.textContent = "";

    // =======================
    //   أول مرة تسجيل
    // =======================
    if (!localStorage.getItem("savedUser") && !localStorage.getItem("savedPass")) {
        localStorage.setItem("savedUser", enteredUser);
        localStorage.setItem("savedPass", enteredPass);
        localStorage.setItem("dashboardNameUser", enteredUser);

        loginBtn.textContent = "Login Successful ✅";
        loginBtn.classList.add("success");

        setTimeout(() => {
            window.location.href = "Dashboard.html";
        }, 2000);

        return; // مهم جداً
    }

    // =======================
    //   تحقق بعد أول مرة
    // =======================
    let savedUser = localStorage.getItem("savedUser");
    let savedPass = localStorage.getItem("savedPass");

    if (enteredUser === savedUser && enteredPass === savedPass) {
        localStorage.setItem("dashboardNameUser", enteredUser);

        loginBtn.textContent = "Login Successful ✅";
        loginBtn.classList.add("success");

        setTimeout(() => {
            window.location.href = "Dashboard.html";
        }, 2000);
    } 
    else {
        passwordError.textContent = "Incorrect username or password";
        passwordError.classList.add("active");

        loginBtn.classList.add("shake", "error");
        loginBtn.textContent = "Incorrect credentials ⚠";

        setTimeout(() => loginBtn.classList.remove("shake"), 300);
        setTimeout(() => {
            loginBtn.textContent = "Login";
            loginBtn.classList.remove("error");
        }, 2000);
    }
};