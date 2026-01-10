// ===== script.js =====
// الملف الرئيسي للبرمجة - لا تلمسيه

// حالة التطبيق
let appState = {
    currentPage: 'home',
    currentCategory: 'all',
    currentLanguage: 'ar',
    favorites: new Set(),
    currentStore: null,
    carouselPosition: 0
};

// تهيئة التطبيق
function initApp() {
    console.log('🚀 بدء تشغيل دليل الجمال...');
    
    // تحميل المفضلة من التخزين المحلي
    loadFavorites();
    
    // إعداد واجهة المستخدم
    setupUI();
    
    // تحميل المحتوى الأولي
    loadHomePage();
    
    // إعداد الأحداث
    setupEvents();
}

// تحميل المفضلة من التخزين المحلي
function loadFavorites() {
    const saved = localStorage.getItem('beautyGuide_favorites');
    if (saved) {
        try {
            const ids = JSON.parse(saved);
            appState.favorites = new Set(ids);
        } catch (e) {
            console.error('خطأ في تحميل المفضلة:', e);
        }
    }
}

// حفظ المفضلة في التخزين المحلي
function saveFavorites() {
    const ids = Array.from(appState.favorites);
    localStorage.setItem('beautyGuide_favorites', JSON.stringify(ids));
}

// إعداد واجهة المستخدم
function setupUI() {
    // إعداد أزرار التنقل
    setupNavigation();
    
    // إعداد تبديل اللغة
    setupLanguageToggle();
    
    // إعداد البحث
    setupSearch();
}

// تحميل الصفحة الرئيسية
function loadHomePage() {
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
                أفضل المتاجر المميزة
            </h2>
            <div class="stores-grid" id="storesContainer"></div>
        </div>
    `;
    
    // تحميل الفئات
    loadCategories();
    
    // تحميل المتاجر
    loadStores();
}

// تحميل الفئات
function loadCategories() {
    const container = document.getElementById('categoriesContainer');
    if (!container) return;
    
    let categoriesHtml = '';
    
    // الفئة "الكل"
    categoriesHtml += `
        <div class="category-card ${appState.currentCategory === 'all' ? 'active' : ''}" 
             data-category="all">
            <i class="fas fa-store"></i>
            <span>الكل</span>
        </div>
    `;
    
    // الفئات الأخرى
    CATEGORIES.forEach(category => {
        categoriesHtml += `
            <div class="category-card ${appState.currentCategory === category.id ? 'active' : ''}" 
                 data-category="${category.id}">
                <i class="${category.icon}"></i>
                <span>${category.name}</span>
            </div>
        `;
    });
    
    container.innerHTML = categoriesHtml;
    
    // إضافة أحداث النقر
    container.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            filterStoresByCategory(category);
            
            // تحديث النشطة
            container.querySelectorAll('.category-card').forEach(c => {
                c.classList.remove('active');
            });
            this.classList.add('active');
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
    
    // فلترة حسب اللغة
    filteredStores = filteredStores.map(store => {
        return {
            ...store,
            displayName: appState.currentLanguage === 'ru' ? (store.name_ru || store.name) : store.name,
            displayDesc: appState.currentLanguage === 'ru' ? (store.description_ru || store.description) : store.description
        };
    });
    
    // عرض المتاجر
    if (filteredStores.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="far fa-store-slash"></i>
                <h3>لا توجد متاجر</h3>
                <p>لم نجد متاجر في هذه الفئة</p>
            </div>
        `;
        return;
    }
    
    let storesHtml = '';
    
    filteredStores.forEach((store, index) => {
        const isFavorite = appState.favorites.has(store.id);
        
        storesHtml += `
            <div class="store-card" data-id="${store.id}" style="animation-delay: ${index * 0.1}s">
                <div class="store-image" style="background-image: url('${store.logo}')"></div>
                <div class="store-info">
                    <div class="store-name">
                        ${store.displayName}
                        <button class="favorite-btn" data-id="${store.id}">
                            <i class="${isFavorite ? 'fas' : 'far'} fa-heart"></i>
                        </button>
                    </div>
                    <div class="store-category">${getCategoryName(store.category)}</div>
                    <p class="store-description">${store.displayDesc.substring(0, 60)}...</p>
                    <div class="store-footer">
                        <div class="store-rating">
                            <i class="fas fa-star"></i>
                            ${store.rating}
                        </div>
                        <button class="details-btn" data-id="${store.id}">
                            <i class="fas fa-eye"></i>
                            التفاصيل
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = storesHtml;
    
    // إضافة أحداث المتاجر
    setupStoreEvents();
}

// فلترة المتاجر حسب الفئة
function filterStoresByCategory(category) {
    appState.currentCategory = category;
    loadStores();
}

// الحصول على اسم الفئة
function getCategoryName(categoryId) {
    const category = CATEGORIES.find(c => c.id === categoryId);
    if (category) {
        return appState.currentLanguage === 'ru' ? (category.name_ru || category.name) : category.name;
    }
    return categoryId;
}

// إعداد أحداث المتاجر
function setupStoreEvents() {
    // زر المفضلة
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const storeId = parseInt(this.getAttribute('data-id'));
            toggleFavorite(storeId);
            
            // تحديث الأيقونة
            const icon = this.querySelector('i');
            const isFavorite = appState.favorites.has(storeId);
            icon.className = isFavorite ? 'fas fa-heart' : 'far fa-heart';
            
            // إشعار
            showNotification(isFavorite ? 'أضيف إلى المفضلة' : 'أزيل من المفضلة');
        });
    });
    
    // زر التفاصيل
    document.querySelectorAll('.details-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const storeId = parseInt(this.getAttribute('data-id'));
            showStoreDetails(storeId);
        });
    });
    
    // النقر على البطاقة
    document.querySelectorAll('.store-card').forEach(card => {
        card.addEventListener('click', function() {
            const storeId = parseInt(this.getAttribute('data-id'));
            showStoreDetails(storeId);
        });
    });
}

// تبديل المفضلة
function toggleFavorite(storeId) {
    if (appState.favorites.has(storeId)) {
        appState.favorites.delete(storeId);
    } else {
        appState.favorites.add(storeId);
    }
    saveFavorites();
}

// عرض تفاصيل المتجر
function showStoreDetails(storeId) {
    const store = STORES.find(s => s.id === storeId);
    if (!store) return;
    
    appState.currentStore = store;
    
    const detailPage = document.getElementById('storeDetailPage');
    const detailContent = detailPage.querySelector('.detail-content');
    
    // تحديث الاسم
    document.getElementById('detailStoreName').textContent = 
        appState.currentLanguage === 'ru' ? (store.name_ru || store.name) : store.name;
    
    // تحضير المحتوى
    const isFavorite = appState.favorites.has(store.id);
    const similarStores = getSimilarStores(store);
    
    let detailsHtml = `
        <div class="store-detail">
            <div class="detail-image" style="background-image: url('${store.logo}')"></div>
            
            <div class="detail-info">
                <div class="info-row">
                    <span class="info-label">التصنيف:</span>
                    <span class="info-value">${getCategoryName(store.category)}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">التقييم:</span>
                    <span class="info-value">
                        <i class="fas fa-star" style="color: #ffc107;"></i>
                        ${store.rating}/5
                    </span>
                </div>
                ${store.price ? `
                <div class="info-row">
                    <span class="info-label">السعر:</span>
                    <span class="info-value">${store.price}</span>
                </div>
                ` : ''}
                ${store.location ? `
                <div class="info-row">
                    <span class="info-label">الموقع:</span>
                    <span class="info-value">${store.location}</span>
                </div>
                ` : ''}
                ${store.working_hours ? `
                <div class="info-row">
                    <span class="info-label">ساعات العمل:</span>
                    <span class="info-value">${store.working_hours}</span>
                </div>
                ` : ''}
                ${store.phone ? `
                <div class="info-row">
                    <span class="info-label">الهاتف:</span>
                    <span class="info-value">${store.phone}</span>
                </div>
                ` : ''}
            </div>
            
            <div class="detail-description">
                <h3><i class="fas fa-info-circle"></i> عن المتجر</h3>
                <p>${appState.currentLanguage === 'ru' ? (store.description_ru || store.description) : store.description}</p>
            </div>
            
            <div class="detail-actions">
                <a href="${store.website}" target="_blank" class="action-btn primary">
                    <i class="fas fa-external-link-alt"></i>
                    زيارة الموقع
                </a>
                <button class="action-btn ${isFavorite ? 'favorite' : 'secondary'}" id="detailFavoriteBtn">
                    <i class="${isFavorite ? 'fas' : 'far'} fa-heart"></i>
                    ${isFavorite ? 'في المفضلة' : 'إضافة للمفضلة'}
                </button>
            </div>
    `;
    
    // إضافة العروض إذا كان هناك
    if (store.offer_code) {
        detailsHtml += `
            <div class="detail-offer">
                <h3><i class="fas fa-gift"></i> عرض خاص</h3>
                <div class="offer-badge">
                    <span class="offer-discount">${store.offer_discount || 'خصم'}</span>
                    <span class="offer-code">كود: ${store.offer_code}</span>
                </div>
                ${store.offer_valid_until ? `
                <p class="offer-valid">صالحة حتى: ${store.offer_valid_until}</p>
                ` : ''}
            </div>
        `;
    }
    
    // إضافة المتاجر المشابهة
    if (similarStores.length > 0) {
        detailsHtml += `
            <div class="carousel-section">
                <div class="carousel-title">
                    <i class="fas fa-store"></i>
                    <span>متاجر مشابهة</span>
                </div>
                <div class="carousel-container">
                    <div class="carousel-track" id="similarStoresCarousel">
        `;
        
        similarStores.forEach(similarStore => {
            detailsHtml += `
                <div class="carousel-item" data-id="${similarStore.id}">
                    <div class="carousel-image" style="background-image: url('${similarStore.logo}')"></div>
                    <div class="carousel-name">${similarStore.name}</div>
                    <div class="carousel-category">${getCategoryName(similarStore.category)}</div>
                </div>
            `;
        });
        
        detailsHtml += `
                    </div>
                    <div class="carousel-nav" id="carouselNav"></div>
                </div>
            </div>
        `;
    }
    
    detailsHtml += `</div>`;
    detailContent.innerHTML = detailsHtml;
    
    // إظهار صفحة التفاصيل
    detailPage.classList.add('active');
    appState.currentPage = 'detail';
    updateNavigation();
    
    // إعداد أحداث صفحة التفاصيل
    setupDetailEvents();
    
    // إعداد الكاروسيل
    if (similarStores.length > 0) {
        setupCarousel();
    }
}

// الحصول على متاجر مشابهة
function getSimilarStores(currentStore) {
    return STORES.filter(store => 
        store.id !== currentStore.id && 
        store.category === currentStore.category
    ).slice(0, 5);
}

// إعداد أحداث صفحة التفاصيل
function setupDetailEvents() {
    // زر المفضلة في التفاصيل
    const favBtn = document.getElementById('detailFavoriteBtn');
    if (favBtn) {
        favBtn.addEventListener('click', function() {
            const storeId = appState.currentStore.id;
            toggleFavorite(storeId);
            
            const isFavorite = appState.favorites.has(storeId);
            const icon = this.querySelector('i');
            icon.className = isFavorite ? 'fas fa-heart' : 'far fa-heart';
            this.className = `action-btn ${isFavorite ? 'favorite' : 'secondary'}`;
            this.innerHTML = `
                <i class="${isFavorite ? 'fas' : 'far'} fa-heart"></i>
                ${isFavorite ? 'في المفضلة' : 'إضافة للمفضلة'}
            `;
            
            showNotification(isFavorite ? 'أضيف إلى المفضلة' : 'أزيل من المفضلة');
        });
    }
    
    // أحداث الكاروسيل
    document.querySelectorAll('.carousel-item').forEach(item => {
        item.addEventListener('click', function() {
            const storeId = parseInt(this.getAttribute('data-id'));
            showStoreDetails(storeId);
        });
    });
}

// إعداد الكاروسيل
function setupCarousel() {
    const track = document.getElementById('similarStoresCarousel');
    const nav = document.getElementById('carouselNav');
    
    if (!track || !nav) return;
    
    const items = track.querySelectorAll('.carousel-item');
    const itemWidth = 140 + 15; // عرض العنصر + الفجوة
    const visibleItems = window.innerWidth < 480 ? 2 : 3;
    const totalSlides = Math.ceil(items.length / visibleItems);
    
    // إعادة تعيين
    track.style.transform = 'translateX(0)';
    appState.carouselPosition = 0;
    
    // إنشاء نقاط التنقل
    nav.innerHTML = '';
    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('div');
        dot.className = 'carousel-dot';
        if (i === 0) dot.classList.add('active');
        dot.setAttribute('data-slide', i);
        dot.addEventListener('click', () => goToSlide(i));
        nav.appendChild(dot);
    }
    
    // إعداد السحب
    setupCarouselDrag(track, itemWidth, visibleItems, totalSlides);
}

// إعداد سحب الكاروسيل
function setupCarouselDrag(track, itemWidth, visibleItems, totalSlides) {
    let isDragging = false;
    let startPos = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    
    track.addEventListener('mousedown', dragStart);
    track.addEventListener('touchstart', dragStart);
    track.addEventListener('mouseup', dragEnd);
    track.addEventListener('touchend', dragEnd);
    track.addEventListener('mousemove', drag);
    track.addEventListener('touchmove', drag);
    
    function dragStart(e) {
        isDragging = true;
        startPos = getPositionX(e);
        track.style.cursor = 'grabbing';
    }
    
    function drag(e) {
        if (!isDragging) return;
        e.preventDefault();
        
        const currentPosition = getPositionX(e);
        const diff = currentPosition - startPos;
        
        // تحديث الموضع
        currentTranslate = prevTranslate + diff;
        track.style.transform = `translateX(${currentTranslate}px)`;
    }
    
    function dragEnd() {
        isDragging = false;
        track.style.cursor = 'grab';
        
        const movedBy = currentTranslate - prevTranslate;
        
        // إذا كانت الحركة كافية، انتقل للشريحة التالية
        if (Math.abs(movedBy) > itemWidth * 0.3) {
            if (movedBy > 0 && appState.carouselPosition > 0) {
                // سحب لليمين
                goToSlide(appState.carouselPosition - 1);
            } else if (movedBy < 0 && appState.carouselPosition < totalSlides - 1) {
                // سحب لليسار
                goToSlide(appState.carouselPosition + 1);
            } else {
                // العودة للموضع السابق
                updateCarouselPosition();
            }
        } else {
            // العودة للموضع السابق
            updateCarouselPosition();
        }
    }
    
    function getPositionX(e) {
        return e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
    }
}

// الانتقال لشريحة محددة
function goToSlide(slideIndex) {
    const track = document.getElementById('similarStoresCarousel');
    const dots = document.querySelectorAll('#carouselNav .carousel-dot');
    const items = track.querySelectorAll('.carousel-item');
    const itemWidth = 140 + 15;
    const visibleItems = window.innerWidth < 480 ? 2 : 3;
    
    if (slideIndex < 0 || slideIndex >= Math.ceil(items.length / visibleItems)) {
        return;
    }
    
    appState.carouselPosition = slideIndex;
    const translateX = -slideIndex * visibleItems * itemWidth;
    track.style.transform = `translateX(${translateX}px)`;
    
    // تحديث النقاط
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === slideIndex);
    });
    
    prevTranslate = translateX;
    currentTranslate = translateX;
}

// تحديث موضع الكاروسيل
function updateCarouselPosition() {
    const track = document.getElementById('similarStoresCarousel');
    const translateX = -appState.carouselPosition * (window.innerWidth < 480 ? 2 : 3) * (140 + 15);
    track.style.transform = `translateX(${translateX}px)`;
    currentTranslate = translateX;
    prevTranslate = translateX;
}

// إعداد التنقل
function setupNavigation() {
    // أزرار التنقل السفلي
    document.getElementById('backBtn').addEventListener('click', goBack);
    document.getElementById('favoritesBtn').addEventListener('click', showFavorites);
    document.getElementById('homeBtn').addEventListener('click', goHome);
    
    // التنقل العلوي
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const page = this.getAttribute('data-tab');
            switchPage(page);
            
            // تحديث النشطة
            document.querySelectorAll('.nav-tab').forEach(t => {
                t.classList.remove('active');
            });
            this.classList.add('active');
        });
    });
    
    // زر إغلاق التفاصيل
    document.getElementById('closeDetailBtn').addEventListener('click', closeStoreDetails);
}

// تحديث حالة التنقل
function updateNavigation() {
    const backBtn = document.getElementById('backBtn');
    const homeBtn = document.getElementById('homeBtn');
    const favoritesBtn = document.getElementById('favoritesBtn');
    
    // إعادة تعيين
    backBtn.classList.remove('active');
    homeBtn.classList.remove('active');
    favoritesBtn.classList.remove('active');
    
    // تعيين النشط حسب الصفحة الحالية
    switch(appState.currentPage) {
        case 'home':
            homeBtn.classList.add('active');
            break;
        case 'favorites':
            favoritesBtn.classList.add('active');
            break;
        case 'detail':
            backBtn.classList.add('active');
            break;
    }
}

// الرجوع
function goBack() {
    if (appState.currentPage === 'detail') {
        closeStoreDetails();
    } else if (appState.currentPage === 'favorites') {
        goHome();
    }
}

// الصفحة الرئيسية
function goHome() {
    appState.currentPage = 'home';
    appState.currentCategory = 'all';
    loadHomePage();
    updateNavigation();
    
    // تحديث التبويبات
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.getAttribute('data-tab') === 'home') {
            tab.classList.add('active');
        }
    });
}

// إغلاق تفاصيل المتجر
function closeStoreDetails() {
    document.getElementById('storeDetailPage').classList.remove('active');
    appState.currentPage = 'home';
    updateNavigation();
}

// عرض المفضلة
function showFavorites() {
    if (appState.favorites.size === 0) {
        document.getElementById('mainContent').innerHTML = `
            <div class="empty-state">
                <i class="far fa-heart"></i>
                <h3>لا توجد متاجر في المفضلة</h3>
                <p>أضيفي متاجرك المفضلة بالضغط على رمز القلب</p>
                <button class="details-btn mt-20" onclick="goHome()">
                    <i class="fas fa-store"></i>
                    تصفح المتاجر
                </button>
            </div>
        `;
    } else {
        const favoriteStores = STORES.filter(store => appState.favorites.has(store.id));
        
        let storesHtml = `
            <div class="stores-section">
                <h2 class="section-title">
                    <i class="fas fa-heart" style="color: #ff4757;"></i>
                    متاجري المفضلة (${favoriteStores.length})
                </h2>
                <div class="stores-grid" id="favoritesContainer"></div>
            </div>
        `;
        
        document.getElementById('mainContent').innerHTML = storesHtml;
        
        const container = document.getElementById('favoritesContainer');
        let favoriteHtml = '';
        
        favoriteStores.forEach(store => {
            favoriteHtml += `
                <div class="store-card" data-id="${store.id}">
                    <div class="store-image" style="background-image: url('${store.logo}')"></div>
                    <div class="store-info">
                        <div class="store-name">
                            ${store.name}
                            <button class="favorite-btn" data-id="${store.id}">
                                <i class="fas fa-heart" style="color: #ff4757;"></i>
                            </button>
                        </div>
                        <div class="store-category">${getCategoryName(store.category)}</div>
                        <p class="store-description">${store.description.substring(0, 60)}...</p>
                        <div class="store-footer">
                            <div class="store-rating">
                                <i class="fas fa-star"></i>
                                ${store.rating}
                            </div>
                            <button class="details-btn" data-id="${store.id}">
                                <i class="fas fa-eye"></i>
                                التفاصيل
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = favoriteHtml;
        
        // إعادة إعداد الأحداث
        setupStoreEvents();
    }
    
    appState.currentPage = 'favorites';
    updateNavigation();
}

// تبديل الصفحات
function switchPage(page) {
    const content = document.getElementById('mainContent');
    
    switch(page) {
        case 'home':
            goHome();
            break;
            
        case 'offers':
            content.innerHTML = `
                <div class="offers-section">
                    <h2 class="section-title">
                        <i class="fas fa-tag"></i>
                        العروض والكوبونات
                    </h2>
                    <div class="offers-grid" id="offersContainer"></div>
                </div>
            `;
            loadOffers();
            break;
            
        case 'trending':
            content.innerHTML = `
                <div class="stores-section">
                    <h2 class="section-title">
                        <i class="fas fa-fire"></i>
                        الأكثر شهرة هذا الأسبوع
                    </h2>
                    <div class="stores-grid" id="trendingContainer"></div>
                </div>
            `;
            loadTrending();
            break;
            
        case 'categories':
            content.innerHTML = `
                <div class="categories-full">
                    <h2 class="section-title">
                        <i class="fas fa-th-large"></i>
                        جميع الفئات
                    </h2>
                    <div class="categories-grid-full" id="allCategories"></div>
                </div>
            `;
            loadAllCategories();
            break;
    }
    
    appState.currentPage = page;
    updateNavigation();
}

// تحميل العروض
function loadOffers() {
    const container = document.getElementById('offersContainer');
    if (!container) return;
    
    const offers = STORES.filter(store => store.offer_code);
    
    if (offers.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="far fa-tag"></i>
                <h3>لا توجد عروض حالية</h3>
                <p>تفقد لاحقاً للعروض الجديدة</p>
            </div>
        `;
        return;
    }
    
    let offersHtml = '';
    
    offers.forEach((store, index) => {
        const offerType = index === 0 ? 'premium' : (index === 1 ? 'blue' : '');
        
        offersHtml += `
            <div class="offer-card ${offerType}">
                <div class="offer-icon">
                    <i class="fas fa-gift"></i>
                </div>
                <h3 class="offer-title">${store.name}</h3>
                <p class="offer-desc">${store.offer_discount || 'خصم خاص'} على ${getCategoryName(store.category)}</p>
                <div class="offer-code">كود الخصم: ${store.offer_code}</div>
                ${store.offer_valid_until ? `
                <p class="offer-valid mt-20">صالحة حتى: ${store.offer_valid_until}</p>
                ` : ''}
                <button class="details-btn mt-20" data-id="${store.id}" 
                        style="background: white; color: ${offerType === 'premium' ? '#9c27b0' : '#ff9800'}">
                    <i class="fas fa-store"></i>
                    زيارة المتجر
                </button>
            </div>
        `;
    });
    
    container.innerHTML = offersHtml;
    
    // إضافة أحداث الأزرار
    container.querySelectorAll('.details-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const storeId = parseInt(this.getAttribute('data-id'));
            showStoreDetails(storeId);
        });
    });
}

// تحميل الأكثر شهرة
function loadTrending() {
    const container = document.getElementById('trendingContainer');
    if (!container) return;
    
    // المتاجر الأعلى تقييماً
    const trendingStores = [...STORES]
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 6);
    
    if (trendingStores.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="far fa-fire"></i>
                <h3>لا توجد متاجر</h3>
                <p>جاري تحديث القائمة</p>
            </div>
        `;
        return;
    }
    
    let trendingHtml = '';
    
    trendingStores.forEach((store, index) => {
        const rank = index + 1;
        const rankClass = rank <= 3 ? 'rank-' + rank : '';
        
        trendingHtml += `
            <div class="store-card ${rankClass}" data-id="${store.id}">
                <div class="store-image" style="background-image: url('${store.logo}')">
                    ${rank <= 3 ? `
                    <div class="store-rank">
                        <i class="fas fa-crown"></i>
                        ${rank}
                    </div>
                    ` : ''}
                </div>
                <div class="store-info">
                    <div class="store-name">
                        ${store.name}
                        <button class="favorite-btn" data-id="${store.id}">
                            <i class="${appState.favorites.has(store.id) ? 'fas' : 'far'} fa-heart"></i>
                        </button>
                    </div>
                    <div class="store-category">${getCategoryName(store.category)}</div>
                    <p class="store-description">${store.description.substring(0, 60)}...</p>
                    <div class="store-footer">
                        <div class="store-rating">
                            <i class="fas fa-star"></i>
                            ${store.rating}
                        </div>
                        <button class="details-btn" data-id="${store.id}">
                            <i class="fas fa-eye"></i>
                            التفاصيل
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = trendingHtml;
    
    // إضافة الأنماط للرتبة
    const style = document.createElement('style');
    style.textContent = `
        .store-rank {
            position: absolute;
            top: 10px;
            right: 10px;
            background: gold;
            color: #333;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 14px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        .store-rank i {
            margin-left: 2px;
        }
    `;
    document.head.appendChild(style);
    
    // إعادة إعداد الأحداث
    setupStoreEvents();
}

// تحميل جميع الفئات
function loadAllCategories() {
    const container = document.getElementById('allCategories');
    if (!container) return;
    
    let categoriesHtml = '';
    
    CATEGORIES.forEach(category => {
        const storesInCategory = STORES.filter(store => store.category === category.id).length;
        
        categoriesHtml += `
            <div class="category-card-large" data-category="${category.id}">
                <div class="category-icon">
                    <i class="${category.icon}"></i>
                </div>
                <div class="category-info">
                    <h3>${category.name}</h3>
                    <p>${storesInCategory} متجر</p>
                </div>
                <i class="fas fa-arrow-left category-arrow"></i>
            </div>
        `;
    });
    
    container.innerHTML = categoriesHtml;
    
    // إضافة الأنماط
    const style = document.createElement('style');
    style.textContent = `
        .categories-grid-full {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        .category-card-large {
            display: flex;
            align-items: center;
            background: white;
            padding: 15px;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow);
            cursor: pointer;
            transition: var(--transition);
            gap: 15px;
        }
        .category-card-large:hover {
            transform: translateX(-5px);
            box-shadow: 0 6px 15px rgba(0,0,0,0.12);
        }
        .category-icon {
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 24px;
        }
        .category-info {
            flex: 1;
        }
        .category-info h3 {
            font-size: 16px;
            margin-bottom: 5px;
            color: var(--dark-color);
        }
        .category-info p {
            font-size: 13px;
            color: var(--gray-color);
        }
        .category-arrow {
            color: var(--gray-color);
            font-size: 18px;
        }
    `;
    document.head.appendChild(style);
    
    // إضافة الأحداث
    container.querySelectorAll('.category-card-large').forEach(card => {
        card.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            goHome();
            setTimeout(() => {
                filterStoresByCategory(category);
                
                // تحديث الفئة النشطة
                document.querySelectorAll('.category-card').forEach(c => {
                    c.classList.remove('active');
                    if (c.getAttribute('data-category') === category) {
                        c.classList.add('active');
                    }
                });
            }, 100);
        });
    });
}

// إعداد تبديل اللغة
function setupLanguageToggle() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const lang = this.getAttribute('data-lang');
            if (lang === appState.currentLanguage) return;
            
            appState.currentLanguage = lang;
            
            // تحديث الأزرار
            document.querySelectorAll('.lang-btn').forEach(b => {
                b.classList.remove('active');
            });
            this.classList.add('active');
            
            // إعادة تحميل المحتوى
            if (appState.currentPage === 'home') {
                loadStores();
            } else if (appState.currentPage === 'detail' && appState.currentStore) {
                showStoreDetails(appState.currentStore.id);
            }
        });
    });
}

// إعداد البحث
function setupSearch() {
    // سيتم إضافة البحث لاحقاً
}

// إظهار الإشعارات
function showNotification(message) {
    // إنشاء عنصر الإشعار
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    
    // إضافة الأنماط
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            top: 100px;
            right: 50%;
            transform: translateX(50%);
            background: var(--primary-color);
            color: white;
            padding: 12px 25px;
            border-radius: 25px;
            z-index: 2000;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            animation: slideDown 0.3s ease;
            display: flex;
            align-items: center;
            gap: 10px;
            font-weight: 500;
            min-width: 200px;
            text-align: center;
        }
        @keyframes slideDown {
            from { top: 50px; opacity: 0; }
            to { top: 100px; opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // إزالة الإشعار بعد 2 ثانية
    setTimeout(() => {
        notification.style.animation = 'slideUp 0.3s ease';
        
        const slideUpStyle = document.createElement('style');
        slideUpStyle.textContent = `
            @keyframes slideUp {
                from { top: 100px; opacity: 1; }
                to { top: 50px; opacity: 0; }
            }
        `;
        document.head.appendChild(slideUpStyle);
        
        setTimeout(() => {
            notification.remove();
            style.remove();
            slideUpStyle.remove();
        }, 300);
    }, 2000);
}

// إعداد الأحداث
function setupEvents() {
    // إضافة حدث للضغط على زر الرجوع في الهاتف
    window.addEventListener('popstate', function() {
        if (appState.currentPage === 'detail') {
            closeStoreDetails();
        } else {
            goHome();
        }
    });
    
    // تحديث الكاروسيل عند تغيير حجم النافذة
    window.addEventListener('resize', function() {
        if (appState.currentPage === 'detail') {
            const track = document.getElementById('similarStoresCarousel');
            if (track) {
                updateCarouselPosition();
            }
        }
    });
}

// تصدير الدوال للاستخدام في HTML
window.initApp = initApp;
window.goHome = goHome;
window.showFavorites = showFavorites;
window.goBack = goBack;
window.toggleFavorite = toggleFavorite;
window.showStoreDetails = showStoreDetails;
window.closeStoreDetails = closeStoreDetails;
window.filterStoresByCategory = filterStoresByCategory;