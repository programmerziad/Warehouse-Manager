    const logoutBtn = document.getElementById("logoutBtn");
    const popup = document.getElementById("logoutPopup");
    const btnYes = document.getElementById("confirmYes");
    const btnNo = document.getElementById("confirmNo");

    const displayGreeting = document.getElementById("time-Edite");
    const nameHolder = document.getElementById("info-Name");

(function () {
        const html = document.documentElement;
        const themeToggle = document.getElementById("themeToggle");

        // تحديث حالة الأيقونات بناءً على الثيم الحالي
        function updateThemeIcons() {
            const darkIcons = document.querySelectorAll(".dark-mode-icon");
            const lightIcons = document.querySelectorAll(".light-mode-icon");
            const isDark = html.classList.contains("dark");

        darkIcons.forEach(
            (el) => (el.style.display = isDark ? "none" : "inline")
        );
            lightIcons.forEach(
                (el) => (el.style.display = isDark ? "inline" : "none")
        );
    }

        // تشغيله عند التحميل
        updateThemeIcons();

        // عند الضغط على زر تغيير الثيم
        themeToggle.addEventListener("click", function () {
            html.classList.toggle("dark");
            updateThemeIcons();
    });
})();

    // logoutBtn.addEventListener("click", function (e) {
    //     e.preventDefault();
    //     popup.style.display = "flex"; // إظهار البوب أب
    // });
    logoutBtn.onclick = function(e) {
        e.preventDefault();
        popup.style.display = "flex"; // إظهار البوب أب
    }

    btnYes.addEventListener("click", function () {
        localStorage.removeItem("savedUser");
        localStorage.removeItem("savedPass");
        localStorage.removeItem("dashboardNameUser");
        
        
        popup.innerHTML = `<p class="popupLogout">Logout Successful ✅</p>`;

        setTimeout(() => {
            window.location.href = "index.html";
        }, 2000);


        // window.location.href = "login_page.html"; // تسجيل الخروج
    });

    btnNo.addEventListener("click", function () {
        popup.style.display = "none"; // إخفاء البوب أب
    });

      // إغلاق البوب أب لو ضغط على أي مكان خارج الصندوق
    // popup.addEventListener("click", function (e) {
    //     if (e.target === popup) {
    //         popup.style.display = "none";
    //     }
    // });




    const hour = new Date().getHours() ;
    let message = "" ; 

    // دا كدا 12 الظهر وكا بعد
    if(hour === 0) {
        message = "GOOD NIGHT";
    }
    // دا كدا 12 منتصف الليل يعني الصبح
    else if( hour === 12 ){
        message = "GOOD MORNING";
    }
    // دا من 12ص ل 11 الصبح
    else if(hour > 0 && hour < 12){
        message = "GOOD MORNING";
    }
    // دا كدا من 1م ل 11م الليل يعني
    else{
        message = "GOOD NIGHT";
    }
    displayGreeting.innerHTML = `${message}`;

    
    // لعرض اسم المستخدم اللي داخل من حقل اسم المستخدم في صفحة تسجيل الدخول
    let dashboardName = localStorage.getItem("dashboardNameUser");
    nameHolder.innerHTML = `<span class="nameHold">Admin:</span> ${dashboardName}`;


