// ===== script.js =====
// الملف الرئيسي للبرمجة

// حالة التطبيق
const appState = {
    currentPage: 'home',
    currentCategory: 'all',
    currentLanguage: 'ar',
    currentTheme: 'light',
    favorites: new Set(),
    currentStore: null,
    carouselPosition: 0,
    searchQuery: '',
    isLoading: false
};

// تهيئة التطبيق
function initApp() {
    console.log('🚀 بدء تشغيل دليل الجمال...');
    
    // تحميل الإعدادات
    loadSettings();
    
    // إعداد واجهة المستخدم
    setupUI();
    
    // تحميل المحتوى الأولي
    loadHomePage();
    
    // إعداد الأحداث
    setupEvents();
    
    // تحديث العدادات
    updateCounters();
}

// تحميل الإعدادات
function loadSettings() {
    // المفضلة
    const savedFavorites = localStorage.getItem('beautyGuide_favorites');
    if (savedFavorites) {
        try {
            appState.favorites = new Set(JSON.parse(savedFavorites));
        } catch (e) {
            console.error('خطأ في تحميل المفضلة:', e);
        }
    }
    
    // اللغة
    const savedLanguage = localStorage.getItem('beautyGuide_language');
    if (savedLanguage && (savedLanguage === 'ar' || savedLanguage === 'ru')) {
        appState.currentLanguage = savedLanguage;
        updateLanguageUI();
    }
    
    // الوضع الداكن
    const savedTheme = localStorage.getItem('beautyGuide_theme');
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
        appState.currentTheme = savedTheme;
        document.body.setAttribute('data-theme', savedTheme);
    }
}

// حفظ الإعدادات
function saveSettings() {
    localStorage.setItem('beautyGuide_favorites', JSON.stringify([...appState.favorites]));
    localStorage.setItem('beautyGuide_language', appState.currentLanguage);
    localStorage.setItem('beautyGuide_theme', appState.currentTheme);
}

// تحديث واجهة اللغة
function updateLanguageUI() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === appState.currentLanguage);
    });
}

// إعداد واجهة المستخدم
function setupUI() {
    // تطبيق الوضع الداكن
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.innerHTML = appState.currentTheme === 'dark' ? 
            '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }
}

// تحديث العدادات
function updateCounters() {
    const favoritesCount = document.getElementById('favoritesCount');
    if (favoritesCount) {
        favoritesCount.textContent = appState.favorites.size;
        favoritesCount.style.display = appState.favorites.size > 0 ? 'flex' : 'none';
    }
}

// تحميل الصفحة الرئيسية
function loadHomePage() {
    appState.currentPage = 'home';
    appState.currentCategory = 'all';
    
    const content = document.getElementById('mainContent');
    
    content.innerHTML = `
        <div class="categories-section">
            <div class="categories-title">
                <i class="fas fa-th-large"></i>
                <span>تصفح حسب الفئة</span>
            </div>
            <div class="categories-grid" id="categoriesContainer"></div>
        </div>
        
        <div class="stores-section">
            <h2 class="section-title">
                <i class="fas fa-crown"></i>
                <span>أفضل المتاجر المميزة</span>
            </h2>
            <div class="stores-grid" id="storesContainer"></div>
        </div>
    `;
    
    loadCategories();
    loadStores();
    updateNavigation();
}

// تحميل الفئات
function loadCategories() {
    const container = document.getElementById('categoriesContainer');
    if (!container) return;
    
    const categories = [
        { id: 'all', name: 'الكل', icon: 'fas fa-store' },
        ...CATEGORIES
    ];
    
    let html = categories.map(category => `
        <div class="category-card ${appState.currentCategory === category.id ? 'active' : ''}" 
             data-category="${category.id}">
            <i class="${category.icon}"></i>
            <span>${category.name}</span>
        </div>
    `).join('');
    
    container.innerHTML = html;
    
    // الأحداث
    container.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => {
            const category = card.getAttribute('data-category');
            filterStoresByCategory(category);
            
            container.querySelectorAll('.category-card').forEach(c => {
                c.classList.remove('active');
            });
            card.classList.add('active');
        });
    });
}

// تحميل المتاجر
function loadStores() {
    const container = document.getElementById('storesContainer');
    if (!container) return;
    
    let filteredStores = STORES;
    
    // فلترة حسب الفئة
    if (appState.currentCategory !== 'all') {
        filteredStores = STORES.filter(store => store.category === appState.currentCategory);
    }
    
    // فلترة حسب البحث
    if (appState.searchQuery) {
        const query = appState.searchQuery.toLowerCase();
        filteredStores = filteredStores.filter(store => 
            store.name.toLowerCase().includes(query) ||
            store.description.toLowerCase().includes(query) ||
            store.category.toLowerCase().includes(query)
        );
    }
    
    if (filteredStores.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="far fa-store-slash"></i>
                <h3>لا توجد متاجر</h3>
                <p>${appState.search