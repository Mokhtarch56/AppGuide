// هذا الكود يعرض متجر واحد فقط من data.json

document.addEventListener('DOMContentLoaded', function() {
    const shopContainer = document.getElementById('singleShop');
    
    // عرض رسالة تحميل
    shopContainer.innerHTML = `
        <div class="loading">
            <p>⏳ جاري تحميل بيانات المتجر...</p>
        </div>
    `;
    
    // جلب بيانات المتجر من data.json
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            // نأخذ المتجر الأول فقط
            const shop = data.shops[0];
            
            // إنشاء بطاقة المتجر
            shopContainer.innerHTML = `
                <img src="${shop.logo}" alt="${shop.name}" class="shop-logo">
                <h2 class="shop-name">${shop.name}</h2>
                <p class="shop-desc">${shop.desc}</p>
                
                <div class="shop-tags">
                    <span class="tag">${shop.category[0]}</span>
                </div>
                
                <a href="${shop.url}" target="_blank" class="visit-btn">
                    🛍️ زيارة المتجر
                </a>
            `;
            
            // رسالة نجاح
            console.log('✅ تم تحميل المتجر بنجاح:', shop.name);
            console.log('📁 مسار الشعار:', shop.logo);
        })
        .catch(error => {
            console.error('❌ خطأ في تحميل البيانات:', error);
            shopContainer.innerHTML = `
                <div class="error">
                    <p>⚠️ حدث خطأ في تحميل المتجر</p>
                    <p>تأكد من:</p>
                    <ul>
                        <li>وجود ملف <code>data.json</code></li>
                        <li>صحة تركيب الملف</li>
                        <li>وجود مجلد <code>logos</code> والصور فيه</li>
                    </ul>
                </div>
            `;
        });
});