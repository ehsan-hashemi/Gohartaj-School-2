// JavaScript مخصوص صفحه پخش زنده - نسخه کامل
document.addEventListener('DOMContentLoaded', function() {
    loadLiveStream();
});

async function loadLiveStream() {
    const container = document.getElementById('live-container');
    if (!container) return;
    
    try {
        showLoading(container);
        
        const response = await fetch('../../data/live.json');
        if (!response.ok) throw new Error('خطا در دریافت اطلاعات پخش زنده');
        
        const liveData = await response.json();
        
        displayLiveStream(liveData);
    } catch (error) {
        console.error('خطا در بارگذاری پخش زنده:', error);
        handleError(container, 'خطا در بارگذاری پخش زنده');
    }
}

function displayLiveStream(liveData) {
    const container = document.getElementById('live-container');
    
    // بررسی وجود iframe
    let iframeContent = liveData.iframe || '';
    
    // اگر محتوا iframe کامل نیست اما لینک آپارات است، آن را تبدیل کنیم
    if (iframeContent && !iframeContent.startsWith('<iframe') && iframeContent.includes('aparat.com')) {
        iframeContent = generateAparatIframe(iframeContent);
    }
    
    const hasIframe = iframeContent && iframeContent.trim() !== '';
    
    container.innerHTML = `
        <div class="live-stream">
            <div class="live-player">
                ${hasIframe ? iframeContent : `
                    <div class="live-placeholder">
                        <i class="fas fa-video-slash"></i>
                        <p>در حال حاضر پخش زنده‌ای در دسترس نیست</p>
                    </div>
                `}
            </div>
            
            <div class="live-info">
                <h2 class="live-title">${liveData.title || 'پخش زنده'}</h2>
                
                ${liveData.startTime ? `
                    <div class="live-meta">
                        <div class="live-meta-item">
                            <i class="fas fa-clock"></i>
                            <span>زمان شروع: ${formatDateTime(liveData.startTime)}</span>
                        </div>
                    </div>
                ` : ''}
                
                ${liveData.description ? `
                    <div class="live-description">
                        <p>${liveData.description}</p>
                    </div>
                ` : ''}
            </div>
            
            ${!hasIframe ? `
                <div class="offline-message">
                    <div class="offline-icon">
                        <i class="fas fa-broadcast-tower"></i>
                    </div>
                    <h3>پخش زنده فعلاً در دسترس نیست</h3>
                    <p>لطفاً در زمان اعلام‌شده برای تماشای پخش زنده مراجعه فرمایید.</p>
                </div>
            ` : ''}
        </div>
        
        <!-- <div class="live-instructions">
            <h3>راهنمای تماشای پخش زنده:</h3>
            <ul>
                <li>برای تماشای پخش زنده، از مرورگرهای به روز استفاده کنید</li>
                <li>در صورت بروز مشکل در پخش، صفحه را رفرش کنید</li>
                <li>برای کیفیت بهتر، از اتصال اینترنت پرسرعت استفاده کنید</li>
                <li>در صورت عدم نمایش پخش، از فعال بودن JavaScript مرورگر اطمینان حاصل کنید</li>
            </ul>
        </div> -->
    `;
    
    // اگر iframe وجود دارد، رویدادهای خطا را برای آن تنظیم می‌کنیم
    if (hasIframe) {
        setupIframeErrorHandling();
    }
}

// تابع برای تولید کد iframe آپارات
function generateAparatIframe(videoUrl) {
    console.log('تبدیل لینک آپارات به iframe:', videoUrl);
    
    let videoId = '';
    
    if (videoUrl.includes('aparat.com/v/')) {
        // فرمت: https://www.aparat.com/v/VIDEO_ID
        videoId = videoUrl.split('/v/')[1];
    } else if (videoUrl.includes('aparat.com/')) {
        // فرمت: https://www.aparat.com/CHANNEL_NAME/live
        const parts = videoUrl.split('/');
        const lastPart = parts[parts.length - 1];
        
        if (lastPart === 'live') {
            // برای پخش زنده، نام کانال را می‌گیریم
            videoId = parts[parts.length - 2] + '/live';
        } else {
            videoId = lastPart;
        }
    }
    
    if (videoId) {
        const iframeCode = `<iframe src="https://www.aparat.com/video/video/embed/vt/frame?video=${videoId}" width="100%" height="500" frameborder="0" allowfullscreen></iframe>`;
        console.log('کد iframe تولید شده:', iframeCode);
        return iframeCode;
    }
    
    console.error('نمی‌توان لینک آپارات را تجزیه کرد:', videoUrl);
    return null;
}

function setupIframeErrorHandling() {
    // این تابع برای مدیریت خطاهای iframe استفاده می‌شود
    const iframe = document.querySelector('.live-player iframe');
    if (iframe) {
        iframe.onload = function() {
            console.log('iframe با موفقیت بارگذاری شد');
            showToast('پخش زنده با موفقیت بارگذاری شد', 'success');
        };
        
        iframe.onerror = function() {
            console.error('خطا در بارگذاری iframe');
            showStreamError();
        };
        
        // بررسی وضعیت iframe بعد از 10 ثانیه
        setTimeout(() => {
            checkIframeStatus();
        }, 10000);
    }
}

function checkIframeStatus() {
    const iframe = document.querySelector('.live-player iframe');
    const livePlayer = document.querySelector('.live-player');
    
    if (iframe) {
        try {
            // اگر iframe قابل دسترسی نباشد، خطا نمایش داده می‌شود
            if (!iframe.contentWindow || iframe.contentWindow.location.href === 'about:blank') {
                showStreamError();
            }
        } catch (error) {
            // به دلیل سیاست CORS ممکن است خطا رخ دهد
            console.log('بررسی وضعیت iframe به دلیل محدودیت CORS ممکن نیست');
        }
    }
}

function showStreamError() {
    const livePlayer = document.querySelector('.live-player');
    if (livePlayer) {
        livePlayer.innerHTML = `
            <div class="stream-error">
                <div class="error-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3>خطا در اتصال به پخش زنده</h3>
                <p>متأسفانه امکان اتصال به پخش زنده وجود ندارد. ممکن است پخش به پایان رسیده باشد یا لینک نامعتبر باشد.</p>
                <div class="error-actions">
                    <button class="btn btn-primary" onclick="retryLiveStream()">تلاش مجدد</button>
                    <button class="btn btn-outline-primary" onclick="checkAparatLink()">بررسی لینک آپارات</button>
                </div>
            </div>
        `;
    }
}

function retryLiveStream() {
    const container = document.getElementById('live-container');
    if (container) {
        loadLiveStream();
    }
}

function checkAparatLink() {
    // نمایش اطلاعات دیباگ برای لینک آپارات
    showToast('در حال بررسی لینک آپارات...', 'info');
    
    // بارگذاری مجدد فایل live.json برای بررسی محتوا
    fetch('../../data/live.json')
        .then(response => response.json())
        .then(liveData => {
            console.log('محتویات فایل live.json:', liveData);
            showToast(`لینک ذخیره شده: ${liveData.iframe}`, 'info');
        })
        .catch(error => {
            console.error('خطا در بررسی لینک:', error);
            showToast('خطا در بررسی لینک آپارات', 'error');
        });
}