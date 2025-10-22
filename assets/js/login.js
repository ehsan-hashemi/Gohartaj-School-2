// JavaScript مخصوص صفحه ورود
document.addEventListener('DOMContentLoaded', function() {
    setupLoginForm();
    setupFormValidation();
});

function setupLoginForm() {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;
    
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(loginForm);
        const userData = {
            fullName: formData.get('fullName'),
            nationalCode: formData.get('nationalCode'),
            password: formData.get('password')
        };
        
        // اعتبارسنجی
        if (!validateForm(userData)) {
            return;
        }
        
        await performLogin(userData);
    });
}

function setupFormValidation() {
    const inputs = document.querySelectorAll('.form-input');
    
    inputs.forEach(input => {
        input.addEventListener('blur', (e) => {
            validateField(e.target);
        });
        
        input.addEventListener('input', (e) => {
            clearFieldError(e.target);
        });
    });
}

function validateForm(userData) {
    let isValid = true;
    
    // اعتبارسنجی نام و نام خانوادگی
    if (!userData.fullName || userData.fullName.trim().length < 3) {
        showFieldError('fullName', 'نام و نام خانوادگی باید حداقل ۳ حرف باشد');
        isValid = false;
    }
    
    // اعتبارسنجی کد ملی
    if (!userData.nationalCode || !isValidNationalCode(userData.nationalCode)) {
        showFieldError('nationalCode', 'کد ملی معتبر نیست');
        isValid = false;
    }
    
    // اعتبارسنجی رمز عبور
    if (!userData.password || userData.password.length < 4) {
        showFieldError('password', 'رمز عبور باید حداقل ۴ حرف باشد');
        isValid = false;
    }
    
    return isValid;
}

function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    
    switch (fieldName) {
        case 'fullName':
            if (!value || value.length < 3) {
                showFieldError(fieldName, 'نام و نام خانوادگی باید حداقل ۳ حرف باشد');
                return false;
            }
            break;
            
        case 'nationalCode':
            if (!value || !isValidNationalCode(value)) {
                showFieldError(fieldName, 'کد ملی معتبر نیست');
                return false;
            }
            break;
            
        case 'password':
            if (!value || value.length < 4) {
                showFieldError(fieldName, 'رمز عبور باید حداقل ۴ حرف باشد');
                return false;
            }
            break;
    }
    
    clearFieldError(field);
    return true;
}

function isValidNationalCode(nationalCode) {
    // الگوی ساده برای کد ملی (۱۰ رقم)
    const nationalCodePattern = /^\d{10}$/;
    return nationalCodePattern.test(nationalCode);
}

function showFieldError(fieldName, message) {
    const field = document.getElementById(fieldName);
    const formGroup = field.closest('.form-group');
    
    // حذف خطای قبلی
    const existingError = formGroup.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
    
    // اضافه کردن خطای جدید
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.textContent = message;
    
    formGroup.appendChild(errorElement);
    field.classList.add('error');
}

function clearFieldError(field) {
    const formGroup = field.closest('.form-group');
    const existingError = formGroup.querySelector('.field-error');
    
    if (existingError) {
        existingError.remove();
    }
    
    field.classList.remove('error');
}

async function performLogin(userData) {
    const loginButton = document.querySelector('.login-button');
    const loginButtonText = document.getElementById('login-button-text');
    const loginLoading = document.getElementById('login-loading');
    const errorElement = document.getElementById('login-error');
    
    // نمایش وضعیت loading
    loginButton.disabled = true;
    loginButtonText.style.display = 'none';
    loginLoading.style.display = 'inline-block';
    errorElement.style.display = 'none';
    
    try {
        const response = await fetch('/data/students.json');
        if (!response.ok) throw new Error('خطا در ارتباط با سرور');
        
        const users = await response.json();
        
        const user = users.find(u => 
            u.fullName === userData.fullName && 
            u.nationalCode === userData.nationalCode && 
            u.password === userData.password
        );
        
        if (user) {
            // ذخیره اطلاعات کاربر
            setUserInStorage(user);
            
            // نمایش پیام موفقیت
            showToast('ورود موفقیت‌آمیز بود', 'success');
            
            // هدایت به داشبورد مناسب
            setTimeout(() => {
                if (user.role === 'admin') {
                    window.location.href = '/dash/admin/';
                } else {
                    window.location.href = '/dash/student/';
                }
            }, 1000);
            
        } else {
            throw new Error('اطلاعات وارد شده صحیح نیست');
        }
    } catch (error) {
        console.error('خطا در ورود:', error);
        
        errorElement.textContent = error.message;
        errorElement.style.display = 'block';
        
        // لرزیدن فرم
        document.querySelector('.login-card').classList.add('shake');
        setTimeout(() => {
            document.querySelector('.login-card').classList.remove('shake');
        }, 500);
    } finally {
        // بازگرداندن وضعیت دکمه
        loginButton.disabled = false;
        loginButtonText.style.display = 'inline';
        loginLoading.style.display = 'none';
    }
}