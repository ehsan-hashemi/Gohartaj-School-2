// JavaScript مخصوص صفحه جزئیات خبر - نمایش ویدیوهای داخلی بدون دکمه‌های اضافی
document.addEventListener('DOMContentLoaded', function() {
    loadNewsItem();
});

async function loadNewsItem() {
    const container = document.getElementById('news-detail-container');
    if (!container) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const newsId = urlParams.get('id');
    
    if (!newsId) {
        container.innerHTML = '<p class="error-message">خبر یافت نشد</p>';
        return;
    }
    
    try {
        showLoading(container);
        
        const response = await fetch('../../data/news.json');
        if (!response.ok) throw new Error('خطا در دریافت خبر');
        
        const news = await response.json();
        const newsItem = news.find(item => item.id == newsId);
        
        if (!newsItem) {
            container.innerHTML = '<p class="error-message">خبر یافت نشد</p>';
            return;
        }
        
        displayNewsItem(newsItem);
        setupShareButton();
    } catch (error) {
        console.error('خطا در بارگذاری خبر:', error);
        handleError(container, 'خطا در بارگذاری خبر');
    }
}

function displayNewsItem(newsItem) {
    const container = document.getElementById('news-detail-container');
    
    let mediaHtml = '';

    // نمایش عکس اگر وجود دارد
    if (newsItem.image && newsItem.image.trim() !== '') {
        mediaHtml += `
            <div class="news-media image-media">
                <img src="${newsItem.image}" alt="${newsItem.title}" class="news-image" onerror="this.style.display='none'">
            </div>
        `;
    }

    // نمایش ویدیو اگر وجود دارد (فایل داخلی)
    if (newsItem.video && newsItem.video.trim() !== '') {
        mediaHtml += createVideoPlayer(newsItem.video, newsItem.title);
    }
    
    // اگر هیچ رسانه‌ای وجود ندارد
    if (!mediaHtml) {
        mediaHtml = '<div class="no-media">هیچ رسانه‌ای برای این خبر موجود نیست</div>';
    }
    
    container.innerHTML = `
        <article class="news-article">
            <header class="news-header">
                <h1 class="news-title">${newsItem.title}</h1>
                <div class="news-meta">
                    <span class="news-date">
                        <i class="fas fa-calendar"></i>
                        ${formatDate(newsItem.date)}
                    </span>
                    <span class="news-author">
                        <i class="fas fa-user"></i>
                        ${newsItem.author}
                    </span>
                </div>
            </header>
            
            ${mediaHtml}
            
            <div class="news-content">
                ${newsItem.content || newsItem.summary || 'محتوایی برای نمایش وجود ندارد.'}
            </div>
            
            <footer class="news-footer">
                <button class="share-button" id="share-btn">
                    <i class="fas fa-share-alt"></i>
                    اشتراک گذاری خبر
                </button>
                
                <div class="news-tags">
                    <span class="tag">اخبار مدرسه</span>
                    <span class="tag">دبیرستان گوهرتاج</span>
                </div>
            </footer>
        </article>
        
        <div class="news-navigation">
            <a href="../../news/" class="btn btn-outline-primary">
                <i class="fas fa-arrow-right"></i>
                بازگشت به لیست اخبار
            </a>
        </div>
    `;
    
    // به‌روزرسانی title صفحه
    document.title = `${newsItem.title} - دبیرستان گوهرتاج`;
}

// تابع برای ایجاد پخش‌کننده ویدیو ساده
function createVideoPlayer(videoPath, title) {
    // بررسی نوع فایل ویدیو
    const videoExt = videoPath.split('.').pop().toLowerCase();
    const supportedFormats = ['mp4', 'webm', 'ogg'];
    
    if (!supportedFormats.includes(videoExt)) {
        return `
            <div class="news-media video-media">
                <div class="video-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h4>فرمت ویدیو پشتیبانی نمی‌شود</h4>
                    <p>فرمت فایل ویدیو باید یکی از موارد زیر باشد: MP4, WebM, OGG</p>
                </div>
            </div>
        `;
    }
    
    return `
        <div class="news-media video-media">
            <div class="video-player-container">
                <video 
                    controls 
                    class="news-video-player"
                    preload="metadata"
                >
                    <source src="${videoPath}" type="video/${videoExt === 'mp4' ? 'mp4' : videoExt === 'webm' ? 'webm' : 'ogg'}">
                    <p>مرورگر شما از پخش‌کننده ویدیو پشتیبانی نمی‌کند. 
                        <a href="${videoPath}">برای دانلود ویدیو کلیک کنید</a>
                    </p>
                </video>
            </div>
        </div>
    `;
}

function setupShareButton() {
    const shareButton = document.getElementById('share-btn');
    if (!shareButton) return;
    
    shareButton.addEventListener('click', () => {
        const currentUrl = window.location.href;
        const title = document.querySelector('.news-title').textContent;
        
        if (navigator.share) {
            navigator.share({
                title: title,
                url: currentUrl
            }).catch(err => {
                console.log('خطا در اشتراک‌گذاری:', err);
                copyToClipboard(currentUrl);
            });
        } else {
            copyToClipboard(currentUrl);
        }
    });
}