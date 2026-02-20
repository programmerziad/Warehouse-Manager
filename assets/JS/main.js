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