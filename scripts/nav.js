// ===========================================
// MOBILE MENU
// ===========================================
function toggleMenu() {
    document.getElementById('navLinks').classList.toggle('active');
}

document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        document.getElementById('navLinks').classList.remove('active');
    });
});

// ===========================================
// LANGUAGE SWITCHER
// ===========================================
function toggleLangMenu() {
    document.getElementById('langDropdown').classList.toggle('active');
}

document.addEventListener('click', (e) => {
    if (!e.target.closest('.lang-switcher')) {
        document.getElementById('langDropdown').classList.remove('active');
    }
});
