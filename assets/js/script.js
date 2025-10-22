// فایل اصلی JavaScript - توابع مشترک بین همه صفحات

// تنظیمات اولیه و توابع کاربردی
document.addEventListener('DOMContentLoaded', function() {
    // بررسی وضعیت لاگین کاربر
    checkLoginStatus();
    
    // تنظیم navigation active
    setActiveNavigation();
    
    // تنظیم event listener برای logout
    setupLogoutButton();
});

// توابع مربوط به وضعیت لاگین
function checkLoginStatus() {
    const user = getUserFromStorage();
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    
    if (user) {
        if (loginBtn) {
            if (window.location.pathname.includes('/dash/')) {
                loginBtn.textContent = 'خروج';
                loginBtn.href = '#';
                loginBtn.onclick = logout;
            } else {
                loginBtn.textContent = 'پنل';
                loginBtn.href = user.role === 'admin' ? '/dash/admin/' : '/dash/student/';
            }
        }
        if (logoutBtn) {
            logoutBtn.onclick = logout;
        }
    }
}

function getUserFromStorage() {
    const userData = localStorage.getItem('gohartaj_user');
    return userData ? JSON.parse(userData) : null;
}

function setUserInStorage(user) {
    localStorage.setItem('gohartaj_user', JSON.stringify(user));
}

function removeUserFromStorage() {
    localStorage.removeItem('gohartaj_user');
}

function isUserLoggedIn() {
    return getUserFromStorage() !== null;
}

function isUserAdmin() {
    const user = getUserFromStorage();
    return user && user.role === 'admin';
}

function isUserStudent() {
    const user = getUserFromStorage();
    return user && user.role === 'student';
}

function logout() {
    removeUserFromStorage();
    window.location.href = '/';
}

function setupLogoutButton() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
}

// توابع مربوط به فرمت تاریخ و زمان
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
    };
    
    try {
        let formatted = date.toLocaleDateString('fa-IR', options);
        // تبدیل اعداد عربی به فارسی
        formatted = convertToPersianNumbers(formatted);
        return formatted;
    } catch (error) {
        return convertToPersianNumbers(dateString);
    }
}

function formatDateTime(dateTimeString) {
    const date = new Date(dateTimeString);
    
    try {
        // فرمت جداگانه برای تاریخ و زمان
        const dateOptions = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric'
        };
        
        const timeOptions = {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        };
        
        const datePart = date.toLocaleDateString('fa-IR', dateOptions);
        const timePart = date.toLocaleTimeString('fa-IR', timeOptions);
        
        // ترکیب تاریخ و زمان بدون کلمه "ساعت"
        let formatted = `${datePart} ${timePart}`;
        
        // تبدیل اعداد عربی به فارسی
        formatted = convertToPersianNumbers(formatted);
        
        return formatted;
    } catch (error) {
        // فرمت جایگزین در صورت خطا
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const hour = date.getHours().toString().padStart(2, '0');
        const minute = date.getMinutes().toString().padStart(2, '0');
        const second = date.getSeconds().toString().padStart(2, '0');
        
        const persianDate = `${convertToPersianNumbers(day)} ${getPersianMonthName(month)} ${convertToPersianNumbers(year)}`;
        const persianTime = `${convertToPersianNumbers(hour)}:${convertToPersianNumbers(minute)}:${convertToPersianNumbers(second)}`;
        
        return `${persianDate} ${persianTime}`;
    }
}

// تابع برای تبدیل اعداد عربی به فارسی
function convertToPersianNumbers(text) {
    if (!text) return text;
    
    const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    
    let result = text.toString();
    
    // تبدیل اعداد عربی به فارسی
    for (let i = 0; i < 10; i++) {
        const regex = new RegExp(arabicNumbers[i], 'g');
        result = result.replace(regex, persianNumbers[i]);
    }
    
    // تبدیل اعداد انگلیسی به فارسی (در صورتی که مرورگر از اعداد انگلیسی استفاده کند)
    result = result.replace(/0/g, '۰');
    result = result.replace(/1/g, '۱');
    result = result.replace(/2/g, '۲');
    result = result.replace(/3/g, '۳');
    result = result.replace(/4/g, '۴');
    result = result.replace(/5/g, '۵');
    result = result.replace(/6/g, '۶');
    result = result.replace(/7/g, '۷');
    result = result.replace(/8/g, '۸');
    result = result.replace(/9/g, '۹');
    
    // حذف کلمه "ساعت" اگر وجود دارد
    result = result.replace(/ساعت/g, '').trim();
    
    // حذف فاصله‌های اضافی
    result = result.replace(/\s+/g, ' ').trim();
    
    return result;
}

// تابع برای گرفتن نام ماه به فارسی
function getPersianMonthName(month) {
    const persianMonths = [
        'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
        'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
    ];
    
    return persianMonths[month - 1] || 'مهر';
}

// تابع برای به‌روزرسانی زمان جاری در داشبوردها
function updateDateTime() {
    const now = new Date();
    const formattedDateTime = formatDateTime(now);
    
    const dateTimeElements = document.querySelectorAll('.current-datetime');
    dateTimeElements.forEach(element => {
        element.textContent = formattedDateTime;
    });
}

// توابع کمکی
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function copyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    
    // نمایش پیام موفقیت
    showToast('لینک در کلیپ‌بورد کپی شد', 'success');
}

function showToast(message, type = 'info') {
    // ایجاد المان toast اگر وجود ندارد
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
        `;
        document.body.appendChild(toastContainer);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        background: var(--secondary-color);
        color: var(--text-color);
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        margin-bottom: 0.5rem;
        border-right: 4px solid ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : type === 'warning' ? '#ffc107' : 'var(--primary-color)'};
        transform: translateX(400px);
        transition: transform 0.3s ease;
    `;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        toast.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (toastContainer.contains(toast)) {
                toastContainer.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

function setActiveNavigation() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        
        const linkPath = link.getAttribute('href');
        if (currentPath === linkPath || 
            (currentPath.includes(linkPath) && linkPath !== '/')) {
            link.classList.add('active');
        }
    });
}

// تابع برای ایجاد modal
function createModal(content, title = '') {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // تنظیم event listener برای دکمه بستن
    modal.querySelector('.close-modal').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // بستن modal با کلیک خارج از آن
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
    
    return modal;
}

// تابع برای نمایش loading
function showLoading(element) {
    element.innerHTML = `
        <div class="loading-container">
            <div class="loading-spinner"></div>
            <p>در حال بارگذاری...</p>
        </div>
    `;
}

// تابع برای مدیریت خطا
function handleError(element, message = 'خطا در بارگذاری اطلاعات') {
    element.innerHTML = `
        <div class="error-container">
            <p>${message}</p>
            <button class="btn btn-primary retry-button">تلاش مجدد</button>
        </div>
    `;
    
    element.querySelector('.retry-button').addEventListener('click', () => {
        window.location.reload();
    });
}