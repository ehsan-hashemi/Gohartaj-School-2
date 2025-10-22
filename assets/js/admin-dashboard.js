// JavaScript مخصوص داشبورد مدیر
document.addEventListener('DOMContentLoaded', function() {
    // بررسی مجوز دسترسی
    if (!isUserLoggedIn() || !isUserAdmin()) {
        window.location.href = '/login/';
        return;
    }
    
    initializeAdminDashboard();
});

function initializeAdminDashboard() {
    // تنظیم ناوبری داشبورد
    setupDashboardNavigation();
    
    // بارگذاری آمار
    loadAdminStats();
    
    // به‌روزرسانی زمان
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    // بارگذاری بخش‌های مختلف
    loadStudents();
    loadTeachers();
    loadClassSchedules();
}

function setupDashboardNavigation() {
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const targetSection = link.getAttribute('data-section');
            
            // به‌روزرسانی وضعیت فعال
            sidebarLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // نمایش بخش مربوطه
            showDashboardSection(targetSection);
        });
    });
}

function showDashboardSection(sectionId) {
    // مخفی کردن همه بخش‌ها
    const sections = document.querySelectorAll('.dashboard-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // نمایش بخش انتخاب شده
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
}

async function loadAdminStats() {
    try {
        const response = await fetch('/data/students.json');
        if (!response.ok) throw new Error('خطا در دریافت اطلاعات کاربران');
        
        const users = await response.json();
        
        const students = users.filter(u => u.role === 'student');
        const teachers = users.filter(u => u.role === 'teacher');
        const admins = users.filter(u => u.role === 'admin');
        
        document.getElementById('student-count').textContent = students.length;
        document.getElementById('teacher-count').textContent = teachers.length;
        document.getElementById('admin-count').textContent = admins.length;
    } catch (error) {
        console.error('خطا در بارگذاری آمار:', error);
        showToast('خطا در بارگذاری آمار', 'error');
    }
}

function updateDateTime() {
    const now = new Date();
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };
    const formattedDate = now.toLocaleDateString('fa-IR', options);
    
    const dateTimeElements = document.querySelectorAll('.current-datetime');
    dateTimeElements.forEach(element => {
        element.textContent = formattedDate;
    });
}

async function loadStudents() {
    const tbody = document.querySelector('#students-table tbody');
    if (!tbody) return;
    
    try {
        const response = await fetch('/data/students.json');
        if (!response.ok) throw new Error('خطا در دریافت اطلاعات دانش آموزان');
        
        const users = await response.json();
        const students = users.filter(u => u.role === 'student');
        
        tbody.innerHTML = '';
        
        if (students.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">هیچ دانش آموزی یافت نشد</td></tr>';
            return;
        }
        
        students.forEach(student => {
            const row = createStudentRow(student);
            tbody.appendChild(row);
        });
        
        // تنظیم جستجو
        setupStudentSearch(students);
    } catch (error) {
        console.error('خطا در بارگذاری دانش آموزان:', error);
        tbody.innerHTML = '<tr><td colspan="5" class="text-center error">خطا در بارگذاری اطلاعات</td></tr>';
    }
}

function createStudentRow(student) {
    const row = document.createElement('tr');
    row.className = 'fade-in';
    
    const profileImage = student.profileImage ? 
        `<img src="${student.profileImage}" alt="${student.fullName}" class="profile-thumb" onerror="this.style.display='none'">` : 
        '<span class="no-image">بدون عکس</span>';
    
    row.innerHTML = `
        <td>${student.fullName}</td>
        <td>${student.nationalCode}</td>
        <td>${student.grade || '-'}</td>
        <td>${student.class || '-'}</td>
        <td>${profileImage}</td>
    `;
    
    return row;
}

function setupStudentSearch(allStudents) {
    const searchInput = document.querySelector('#student-search');
    const searchButton = document.querySelector('#student-search + .search-button');
    const tbody = document.querySelector('#students-table tbody');
    
    if (!searchInput || !searchButton || !tbody) return;
    
    const performSearch = () => {
        const query = searchInput.value.toLowerCase().trim();
        
        if (query === '') {
            // نمایش همه دانش آموزان
            tbody.innerHTML = '';
            allStudents.forEach(student => {
                const row = createStudentRow(student);
                tbody.appendChild(row);
            });
            return;
        }
        
        const filteredStudents = allStudents.filter(student => 
            student.fullName.toLowerCase().includes(query) ||
            student.nationalCode.includes(query) ||
            (student.grade && student.grade.toLowerCase().includes(query)) ||
            (student.class && student.class.toLowerCase().includes(query))
        );
        
        tbody.innerHTML = '';
        
        if (filteredStudents.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">هیچ دانش آموزی یافت نشد</td></tr>';
            return;
        }
        
        filteredStudents.forEach(student => {
            const row = createStudentRow(student);
            tbody.appendChild(row);
        });
    };
    
    searchInput.addEventListener('input', debounce(performSearch, 300));
    searchButton.addEventListener('click', performSearch);
}

async function loadTeachers() {
    const tbody = document.querySelector('#teachers-table tbody');
    if (!tbody) return;
    
    try {
        const response = await fetch('/data/students.json');
        if (!response.ok) throw new Error('خطا در دریافت اطلاعات معلمان');
        
        const users = await response.json();
        const teachers = users.filter(u => u.role === 'teacher');
        
        tbody.innerHTML = '';
        
        if (teachers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center">هیچ معلمی یافت نشد</td></tr>';
            return;
        }
        
        teachers.forEach(teacher => {
            const row = createTeacherRow(teacher);
            tbody.appendChild(row);
        });
        
        // تنظیم جستجو
        setupTeacherSearch(teachers);
    } catch (error) {
        console.error('خطا در بارگذاری معلمان:', error);
        tbody.innerHTML = '<tr><td colspan="4" class="text-center error">خطا در بارگذاری اطلاعات</td></tr>';
    }
}

function createTeacherRow(teacher) {
    const row = document.createElement('tr');
    row.className = 'fade-in';
    
    const profileImage = teacher.profileImage ? 
        `<img src="${teacher.profileImage}" alt="${teacher.fullName}" class="profile-thumb" onerror="this.style.display='none'">` : 
        '<span class="no-image">بدون عکس</span>';
    
    row.innerHTML = `
        <td>${teacher.fullName}</td>
        <td>${teacher.nationalCode}</td>
        <td>${teacher.subject || '-'}</td>
        <td>${profileImage}</td>
    `;
    
    return row;
}

function setupTeacherSearch(allTeachers) {
    const searchInput = document.querySelector('#teacher-search');
    const searchButton = document.querySelector('#teacher-search + .search-button');
    const tbody = document.querySelector('#teachers-table tbody');
    
    if (!searchInput || !searchButton || !tbody) return;
    
    const performSearch = () => {
        const query = searchInput.value.toLowerCase().trim();
        
        if (query === '') {
            // نمایش همه معلمان
            tbody.innerHTML = '';
            allTeachers.forEach(teacher => {
                const row = createTeacherRow(teacher);
                tbody.appendChild(row);
            });
            return;
        }
        
        const filteredTeachers = allTeachers.filter(teacher => 
            teacher.fullName.toLowerCase().includes(query) ||
            teacher.nationalCode.includes(query) ||
            (teacher.subject && teacher.subject.toLowerCase().includes(query))
        );
        
        tbody.innerHTML = '';
        
        if (filteredTeachers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center">هیچ معلمی یافت نشد</td></tr>';
            return;
        }
        
        filteredTeachers.forEach(teacher => {
            const row = createTeacherRow(teacher);
            tbody.appendChild(row);
        });
    };
    
    searchInput.addEventListener('input', debounce(performSearch, 300));
    searchButton.addEventListener('click', performSearch);
}

async function loadClassSchedules() {
    const classSelect = document.getElementById('class-select');
    const scheduleContainer = document.getElementById('schedule-container');
    
    if (!classSelect || !scheduleContainer) return;
    
    try {
        const response = await fetch('/data/schedules.json');
        if (!response.ok) throw new Error('خطا در دریافت برنامه‌های کلاسی');
        
        const schedules = await response.json();
        
        // پر کردن dropdown انتخاب کلاس
        classSelect.innerHTML = '<option value="">انتخاب کلاس</option>';
        
        const classes = [...new Set(schedules.map(schedule => schedule.class))];
        classes.forEach(className => {
            const option = document.createElement('option');
            option.value = className;
            option.textContent = className;
            classSelect.appendChild(option);
        });
        
        classSelect.addEventListener('change', () => {
            const selectedClass = classSelect.value;
            
            if (!selectedClass) {
                scheduleContainer.innerHTML = '';
                return;
            }
            
            const classSchedule = schedules.find(schedule => schedule.class === selectedClass);
            
            if (classSchedule) {
                displaySchedule(classSchedule, scheduleContainer);
            } else {
                scheduleContainer.innerHTML = '<p class="text-center">برنامه‌ای برای این کلاس یافت نشد</p>';
            }
        });
    } catch (error) {
        console.error('خطا در بارگذاری برنامه‌های کلاسی:', error);
        scheduleContainer.innerHTML = '<p class="error-message">خطا در بارگذاری برنامه‌های کلاسی</p>';
    }
}

function displaySchedule(schedule, container) {
    const days = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه'];
    const periods = ['اول', 'دوم', 'سوم', 'چهارم', 'پنجم', 'ششم'];
    
    let tableHtml = `
        <div class="schedule-table-container">
            <h4>برنامه هفتگی کلاس ${schedule.class}</h4>
            <table class="schedule-table">
                <thead>
                    <tr>
                        <th>زمان/روز</th>
    `;
    
    days.forEach(day => {
        tableHtml += `<th>${day}</th>`;
    });
    
    tableHtml += `</tr></thead><tbody>`;
    
    periods.forEach(period => {
        tableHtml += `<tr><td class="period-name">${period}</td>`;
        
        days.forEach(day => {
            const subject = schedule.schedule[day] ? schedule.schedule[day][period] : '';
            tableHtml += `<td>${subject || '-'}</td>`;
        });
        
        tableHtml += `</tr>`;
    });
    
    tableHtml += `</tbody></table></div>`;
    
    container.innerHTML = tableHtml;
}