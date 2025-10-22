// JavaScript مخصوص صفحه اصلی - نسخه اصلاح شده
document.addEventListener('DOMContentLoaded', function() {
    loadAnnouncements();
    loadLatestNews();
});

async function loadAnnouncements() {
    const container = document.getElementById('announcements-container');
    if (!container) return;
    
    try {
        showLoading(container);
        
        const response = await fetch('/data/announcements.json');
        if (!response.ok) throw new Error('خطا در دریافت اطلاعیه‌ها');
        
        const announcements = await response.json();
        
        container.innerHTML = '';
        
        // نمایش حداکثر 5 اطلاعیه آخر
        const latestAnnouncements = announcements.slice(0, 5);
        
        if (latestAnnouncements.length === 0) {
            container.innerHTML = '<p class="text-center">هیچ اطلاعیه‌ای موجود نیست</p>';
            return;
        }
        
        latestAnnouncements.forEach(announcement => {
            const card = createAnnouncementCard(announcement);
            container.appendChild(card);
        });
    } catch (error) {
        console.error('خطا در بارگذاری اطلاعیه‌ها:', error);
        handleError(container, 'خطا در بارگذاری اطلاعیه‌ها');
    }
}

function createAnnouncementCard(announcement) {
    const card = document.createElement('div');
    card.className = 'card fade-in';
    card.innerHTML = `
        <div class="card-content">
            <h3 class="card-title">${announcement.title}</h3>
            <p class="card-description">${announcement.description}</p>
            <div class="card-meta">
                <span class="card-date">${formatDate(announcement.date)}</span>
                <span class="card-author">${announcement.author}</span>
            </div>
        </div>
    `;
    return card;
}

async function loadLatestNews() {
    const container = document.getElementById('news-container');
    if (!container) return;
    
    try {
        showLoading(container);
        
        const response = await fetch('/data/news.json');
        if (!response.ok) throw new Error('خطا در دریافت اخبار');
        
        const news = await response.json();
        
        container.innerHTML = '';
        
        // نمایش حداکثر 5 خبر آخر
        const latestNews = news.slice(0, 5);
        
        if (latestNews.length === 0) {
            container.innerHTML = '<p class="text-center">هیچ خبری موجود نیست</p>';
            return;
        }
        
        latestNews.forEach(newsItem => {
            const card = createNewsCard(newsItem);
            container.appendChild(card);
        });
    } catch (error) {
        console.error('خطا در بارگذاری اخبار:', error);
        handleError(container, 'خطا در بارگذاری اخبار');
    }
}

function createNewsCard(newsItem) {
    const card = document.createElement('div');
    card.className = 'card fade-in';
    card.addEventListener('click', () => {
        window.location.href = `/news/item/?id=${newsItem.id}`;
    });
    
    let mediaHtml = '';
    
    // اولویت با عکس است، اگر عکس نبود ویدیو نمایش داده می‌شود
    if (newsItem.image && newsItem.image.trim() !== '') {
        mediaHtml = `
            <div class="card-media">
                <img src="${newsItem.image}" alt="${newsItem.title}" class="card-image" onerror="this.style.display='none'">
                ${newsItem.video ? '<div class="media-badge video-badge"><i class="fas fa-play"></i></div>' : ''}
            </div>
        `;
    } else if (newsItem.video && newsItem.video.trim() !== '') {
        mediaHtml = `
            <div class="card-media">
                <div class="video-thumbnail">
                    <p>فیلم</p>
                </div>
                <div class="media-badge video-badge"><i class="fas fa-play"></i></div>
            </div>
        `;
    }
    
    card.innerHTML = `
        ${mediaHtml}
        <div class="card-content">
            <h3 class="card-title">${newsItem.title}</h3>
            <p class="card-description">${newsItem.summary}</p>
            <div class="card-meta">
                <span class="card-date">${formatDate(newsItem.date)}</span>
                <span class="card-author">${newsItem.author}</span>
                ${newsItem.video ? '<span class="card-video-indicator"><i class="fas fa-video"></i></span>' : ''}
            </div>
        </div>
    `;
    return card;
}