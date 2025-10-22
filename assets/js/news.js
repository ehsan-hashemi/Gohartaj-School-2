// JavaScript مخصوص صفحه لیست اخبار - پشتیبانی از ویدیوهای داخلی
let allNews = [];
let currentPage = 1;
const newsPerPage = 20;
let currentSort = 'newest';
let currentSearchQuery = '';

document.addEventListener('DOMContentLoaded', function() {
    loadNews();
    setupSearch();
    setupSorting();
});

async function loadNews() {
    const container = document.getElementById('news-list-container');
    if (!container) return;
    
    try {
        showLoading(container);
        
        const response = await fetch('../../data/news.json');
        if (!response.ok) throw new Error('خطا در دریافت اخبار');
        
        allNews = await response.json();
        
        // مرتب‌سازی اولیه
        sortNews('newest');
        
        displayNews();
        setupPagination();
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

function sortNews(sortType) {
    currentSort = sortType;
    
    switch (sortType) {
        case 'newest':
            allNews.sort((a, b) => new Date(b.date) - new Date(a.date));
            break;
        case 'oldest':
            allNews.sort((a, b) => new Date(a.date) - new Date(b.date));
            break;
    }
}

function displayNews(news = allNews) {
    const container = document.getElementById('news-list-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    const startIndex = (currentPage - 1) * newsPerPage;
    const endIndex = startIndex + newsPerPage;
    const newsToDisplay = news.slice(startIndex, endIndex);
    
    if (newsToDisplay.length === 0) {
        container.innerHTML = '<p class="text-center">هیچ خبری یافت نشد</p>';
        return;
    }
    
    newsToDisplay.forEach(newsItem => {
        const card = createNewsCard(newsItem);
        container.appendChild(card);
    });
}

function setupSearch() {
    const searchInput = document.querySelector('.search-input');
    const searchButton = document.querySelector('.search-button');
    
    if (!searchInput || !searchButton) return;
    
    const performSearch = () => {
        currentSearchQuery = searchInput.value.toLowerCase().trim();
        currentPage = 1;
        
        if (currentSearchQuery === '') {
            displayNews();
            setupPagination();
            return;
        }
        
        const filteredNews = allNews.filter(newsItem => 
            newsItem.title.toLowerCase().includes(currentSearchQuery) || 
            (newsItem.content && newsItem.content.toLowerCase().includes(currentSearchQuery)) ||
            (newsItem.summary && newsItem.summary.toLowerCase().includes(currentSearchQuery))
        );
        
        displayNews(filteredNews);
        setupPagination(filteredNews);
    };
    
    searchInput.addEventListener('input', debounce(performSearch, 300));
    searchButton.addEventListener('click', performSearch);
}

function setupSorting() {
    const sortButtons = document.querySelectorAll('.sort-button');
    
    if (!sortButtons.length) return;
    
    sortButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const sortType = e.target.textContent === 'جدیدترین ها' ? 'newest' : 'oldest';
            
            sortButtons.forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            
            sortNews(sortType);
            currentPage = 1;
            displayNews();
            setupPagination();
        });
    });
}

function setupPagination(news = allNews) {
    const container = document.getElementById('pagination-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    const totalPages = Math.ceil(news.length / newsPerPage);
    
    if (totalPages <= 1) return;
    
    if (currentPage > 1) {
        const prevButton = document.createElement('button');
        prevButton.className = 'page-button';
        prevButton.innerHTML = '&rarr; قبلی';
        prevButton.addEventListener('click', () => {
            currentPage--;
            displayNews(news);
            setupPagination(news);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        container.appendChild(prevButton);
    }
    
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.className = `page-button ${i === currentPage ? 'active' : ''}`;
        pageButton.textContent = i;
        pageButton.addEventListener('click', () => {
            currentPage = i;
            displayNews(news);
            setupPagination(news);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        container.appendChild(pageButton);
    }
    
    if (currentPage < totalPages) {
        const nextButton = document.createElement('button');
        nextButton.className = 'page-button';
        nextButton.innerHTML = 'بعدی &larr;';
        nextButton.addEventListener('click', () => {
            currentPage++;
            displayNews(news);
            setupPagination(news);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        container.appendChild(nextButton);
    }
}