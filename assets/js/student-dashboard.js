// JavaScript مخصوص داشبورد دانش آموز - نسخه اصلاح شده
document.addEventListener('DOMContentLoaded', function() {
    console.log('دانش آموز Dashboard در حال بارگذاری...');
    
    // بررسی مجوز دسترسی
    if (!isUserLoggedIn()) {
        console.log('کاربر لاگین نکرده است. هدایت به صفحه ورود...');
        window.location.href = '/login/';
        return;
    }
    
    const user = getUserFromStorage();
    if (!user || user.role !== 'student') {
        console.log('کاربر دانش آموز نیست. هدایت به صفحه ورود...');
        window.location.href = '/login/';
        return;
    }
    
    console.log('کاربر دانش آموز شناسایی شد:', user.fullName);
    initializeStudentDashboard();
});

function initializeStudentDashboard() {
    console.log('در حال راه‌اندازی داشبورد دانش آموز...');
    
    // بارگذاری اطلاعات دانش آموز
    loadStudentInfo();
    
    // تنظیم ناوبری داشبورد
    setupStudentDashboardNavigation();
    
    // به‌روزرسانی زمان
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    // بارگذاری بخش‌های مختلف
    loadStudentLatestReportCard();
    loadStudentSchedule();
    loadStudentReportCards();
    
    console.log('داشبورد دانش آموز با موفقیت راه‌اندازی شد');
}

function loadStudentInfo() {
    const user = getUserFromStorage();
    console.log('بارگذاری اطلاعات دانش آموز:', user);
    
    if (user) {
        // به‌روزرسانی اطلاعات در بخش خانه
        const studentNameElement = document.getElementById('student-name');
        const welcomeStudentNameElement = document.getElementById('welcome-student-name');
        
        if (studentNameElement) studentNameElement.textContent = user.fullName;
        if (welcomeStudentNameElement) welcomeStudentNameElement.textContent = user.fullName;
        
        // به‌روزرسانی عکس پروفایل
        if (user.profileImage) {
            const avatar = document.getElementById('student-avatar');
            const profileImage = document.getElementById('profile-image');
            
            if (avatar) {
                avatar.src = user.profileImage;
                avatar.onerror = function() {
                    this.src = '../../assets/images/profiles/default-avatar.jpg';
                };
            }
            if (profileImage) {
                profileImage.src = user.profileImage;
                profileImage.onerror = function() {
                    this.src = '../../assets/images/profiles/default-avatar.jpg';
                };
            }
        } else {
            // استفاده از عکس پیش‌فرض
            const avatar = document.getElementById('student-avatar');
            const profileImage = document.getElementById('profile-image');
            if (avatar) avatar.src = '../../assets/images/profiles/default-avatar.jpg';
            if (profileImage) profileImage.src = '../../assets/images/profiles/default-avatar.jpg';
        }
        
        // به‌روزرسانی اطلاعات در بخش پروفایل
        document.getElementById('profile-fullname').textContent = user.fullName || '--';
        document.getElementById('profile-nationalcode').textContent = user.nationalCode || '--';
        document.getElementById('profile-password').textContent = user.password ? '••••••' : '--';
        document.getElementById('profile-grade').textContent = user.grade || '--';
        document.getElementById('profile-class').textContent = user.class || '--';
        
        // به‌روزرسانی نام کلاس در بخش برنامه کلاسی
        const scheduleClassName = document.getElementById('schedule-class-name');
        if (scheduleClassName) {
            scheduleClassName.textContent = user.class || '--';
        }
        
        // به‌روزرسانی اطلاعات کلاس در سایدبار
        const studentClassElement = document.getElementById('student-class');
        if (studentClassElement) {
            studentClassElement.textContent = `${user.class || '--'} - ${user.grade || '--'}`;
        }
    } else {
        console.error('اطلاعات کاربر یافت نشد');
    }
}

function setupStudentDashboardNavigation() {
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    console.log('تنظیم ناوبری داشبورد، تعداد لینک‌ها:', sidebarLinks.length);
    
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const targetSection = link.getAttribute('data-section');
            console.log('کلیک روی بخش:', targetSection);
            
            // به‌روزرسانی وضعیت فعال
            sidebarLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // نمایش بخش مربوطه
            showStudentDashboardSection(targetSection);
        });
    });
}

function showStudentDashboardSection(sectionId) {
    console.log('نمایش بخش:', sectionId);
    
    // مخفی کردن همه بخش‌ها
    const sections = document.querySelectorAll('.dashboard-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // نمایش بخش انتخاب شده
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        
        // اگر بخش کارنامه است، اطلاعات را تازه‌سازی کن
        if (sectionId === 'student-report-cards') {
            loadStudentReportCards();
        }
    }
}

function loadStudentLatestReportCard() {
    const user = getUserFromStorage();
    const latestReportCardElement = document.getElementById('latest-report-card');
    
    if (!latestReportCardElement) return;
    
    if (user && user.reportCards && user.reportCards.length > 0) {
        const latestReportCard = user.reportCards[user.reportCards.length - 1];
        latestReportCardElement.textContent = latestReportCard.term || 'کارنامه جدید';
    } else {
        latestReportCardElement.textContent = 'کارنامه‌ای موجود نیست';
    }
}

async function loadStudentSchedule() {
    const container = document.getElementById('student-schedule-container');
    if (!container) return;
    
    const user = getUserFromStorage();
    if (!user || !user.class) {
        container.innerHTML = '<p class="text-center">کلاس شما تعریف نشده است</p>';
        return;
    }
    
    try {
        console.log('در حال بارگذاری برنامه کلاسی برای کلاس:', user.class);
        
        const response = await fetch('../../data/schedules.json');
        if (!response.ok) throw new Error('خطا در دریافت برنامه کلاسی');
        
        const schedules = await response.json();
        console.log('برنامه‌های کلاسی دریافت شد:', schedules);
        
        const studentSchedule = schedules.find(schedule => schedule.class === user.class);
        
        if (studentSchedule) {
            displaySchedule(studentSchedule, container);
        } else {
            container.innerHTML = '<p class="text-center">برنامه‌ای برای کلاس شما یافت نشد</p>';
        }
    } catch (error) {
        console.error('خطا در بارگذاری برنامه کلاسی:', error);
        container.innerHTML = `
            <div class="error-container">
                <p>خطا در بارگذاری برنامه کلاسی</p>
                <button class="btn btn-primary retry-button" onclick="loadStudentSchedule()">تلاش مجدد</button>
            </div>
        `;
    }
}

function displaySchedule(schedule, container) {
    const days = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه'];
    const periods = ['اول', 'دوم', 'سوم', 'چهارم', 'پنجم', 'ششم'];
    
    let tableHtml = `
        <div class="schedule-table-container">
            <table class="schedule-table">
                <thead>
                    <tr>
                        <th>زمان</th>
    `;
    
    days.forEach(day => {
        tableHtml += `<th>${day}</th>`;
    });
    
    tableHtml += `</tr></thead><tbody>`;
    
    periods.forEach(period => {
        tableHtml += `<tr><td class="period-name">${period}</td>`;
        
        days.forEach(day => {
            const subject = schedule.schedule && schedule.schedule[day] ? schedule.schedule[day][period] : '';
            tableHtml += `<td>${subject || '-'}</td>`;
        });
        
        tableHtml += `</tr>`;
    });
    
    tableHtml += `</tbody></table></div>`;
    
    container.innerHTML = tableHtml;
}

function loadStudentReportCards() {
    const container = document.getElementById('report-cards-container');
    if (!container) return;
    
    const user = getUserFromStorage();
    
    if (!user || !user.reportCards || user.reportCards.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>کارنامه‌ای موجود نیست</h3>
                <p>در حال حاضر هیچ کارنامه‌ای برای شما صادر نشده است.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    user.reportCards.forEach((reportCard, index) => {
        const card = createReportCard(reportCard, index);
        container.appendChild(card);
    });
    
    // تنظیم event listener برای دکمه‌های مشاهده کارنامه
    setupReportCardViewers();
}

function createReportCard(reportCard, index) {
    const card = document.createElement('div');
    card.className = 'card fade-in';
    card.innerHTML = `
        <div class="card-content">
            <div class="report-card-header">
                <h3 class="card-title">کارنامه ${reportCard.term || 'نامشخص'}</h3>
                <span class="report-card-average">میانگین: ${reportCard.average || '--'}</span>
            </div>
            <p class="card-description">کارنامه تحصیلی ${reportCard.term || 'ترم نامشخص'}</p>
            <div class="card-actions">
                <button class="btn btn-primary view-report-card" data-pdf="${reportCard.pdf || ''}" data-term="${reportCard.term || ''}">
                    مشاهده کارنامه
                </button>
                ${reportCard.pdf ? `
                    <a href="${reportCard.pdf}" class="btn btn-outline-primary" download="کارنامه_${reportCard.term || 'نامشخص'}.pdf">
                        دانلود
                    </a>
                ` : ''}
            </div>
        </div>
    `;
    return card;
}

function setupReportCardViewers() {
    document.querySelectorAll('.view-report-card').forEach(button => {
        button.addEventListener('click', (e) => {
            const pdfUrl = e.target.getAttribute('data-pdf');
            const term = e.target.getAttribute('data-term');
            
            if (pdfUrl) {
                openPdfViewer(pdfUrl, term);
            } else {
                showToast('فایل کارنامه در دسترس نیست', 'error');
            }
        });
    });
}

function openPdfViewer(pdfUrl, term) {
    const modalContent = `
        <div class="pdf-viewer-container">
            <iframe src="${pdfUrl}" class="pdf-viewer" frameborder="0"></iframe>
            <div class="pdf-controls">
                <a href="${pdfUrl}" class="btn btn-primary" download="کارنامه_${term || 'نامشخص'}.pdf">
                    دانلود کارنامه
                </a>
                <button class="btn btn-outline-primary" id="print-pdf">
                    چاپ
                </button>
                <button class="btn btn-secondary" id="close-pdf">
                    بستن
                </button>
            </div>
        </div>
    `;
    
    const modal = createModal(modalContent, `کارنامه ${term || ''}`);
    
    // تنظیم event listener برای دکمه چاپ
    const printBtn = modal.querySelector('#print-pdf');
    if (printBtn) {
        printBtn.addEventListener('click', () => {
            window.print();
        });
    }
    
    // تنظیم event listener برای دکمه بستن
    const closeBtn = modal.querySelector('#close-pdf');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            const modalElement = closeBtn.closest('.modal');
            if (modalElement) {
                document.body.removeChild(modalElement);
            }
        });
    }
}

// توابع کمکی جدید
function changeProfileImage() {
    showToast('این قابلیت به زودی فعال خواهد شد', 'info');
}

function changePassword() {
    showToast('این قابلیت به زودی فعال خواهد شد', 'info');
}