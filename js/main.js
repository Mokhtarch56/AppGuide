// بيانات المتاجر مؤقتًا بدون شعارات
const stores = [
  { name: "Sephora", logo: "", description: "أحمر شفاه، كريمات، فرش", rating: 4.5, url: "https://www.sephora.com" },
  { name: "Huda Beauty", logo: "", description: "مستحضرات تجميل فاخرة", rating: 4.8, url: "https://hudabeauty.com" },
  { name: "MAC", logo: "", description: "مكياج احترافي", rating: 4.6, url: "https://www.maccosmetics.com" }
];

// التعامل مع النقر على الفئات
document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', () => {
        const category = card.dataset.category;
        // هنا يمكنك استبدال المحتوى حسب الفئة
        alert(`تم اختيار الفئة: ${category}`);
    });
});

// عرض المتاجر في صفحة الفئة (مثال)
function showStores() {
    const main = document.getElementById('main-content');
    main.innerHTML = ""; // مسح المحتوى الحالي
    stores.forEach(store => {
        const div = document.createElement('div');
        div.className = "store-card";
        div.innerHTML = `
            <h3>${store.name}</h3>
            <p>${store.description}</p>
            <p>⭐ ${store.rating}/5</p>
            <a href="${store.url}" target="_blank">زيارة المتجر</a>
        `;
        main.appendChild(div);
    });
}

// مثال: عند النقر على فئة "متاجر" نعرض جميع المتاجر
document.querySelector('[data-category="stores"]').addEventListener('click', showStores);
