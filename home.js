// HH310: Timetable Creator and Automated Attendance System

// Sample Data (from provided JSON)
let appData = {
    subjects: [
        {"id": 1, "name": "Mathematics", "code": "MATH101", "credits": 4, "duration": 60},
        {"id": 2, "name": "Physics", "code": "PHYS101", "credits": 4, "duration": 60},
        {"id": 3, "name": "Chemistry", "code": "CHEM101", "credits": 3, "duration": 60},
        {"id": 4, "name": "English", "code": "ENG101", "credits": 2, "duration": 45},
        {"id": 5, "name": "Computer Science", "code": "CS101", "credits": 4, "duration": 90}
    ],
    teachers: [
        {"id": 1, "name": "Dr. Sarah Johnson", "specialization": "Mathematics", "availability": ["Monday", "Tuesday", "Wednesday", "Thursday"], "maxHours": 20},
        {"id": 2, "name": "Prof. Michael Chen", "specialization": "Physics", "availability": ["Monday", "Tuesday", "Wednesday", "Friday"], "maxHours": 18},
        {"id": 3, "name": "Dr. Emily Davis", "specialization": "Chemistry", "availability": ["Tuesday", "Wednesday", "Thursday", "Friday"], "maxHours": 16},
        {"id": 4, "name": "Ms. Jennifer Wilson", "specialization": "English", "availability": ["Monday", "Wednesday", "Thursday", "Friday"], "maxHours": 15},
        {"id": 5, "name": "Dr. Robert Taylor", "specialization": "Computer Science", "availability": ["Monday", "Tuesday", "Thursday", "Friday"], "maxHours": 22}
    ],
    classrooms: [
        {"id": 1, "name": "Room A101", "capacity": 40, "equipment": ["Projector", "Whiteboard"], "type": "Lecture Hall"},
        {"id": 2, "name": "Room B205", "capacity": 30, "equipment": ["Computers", "Projector"], "type": "Computer Lab"},
        {"id": 3, "name": "Room C103", "capacity": 25, "equipment": ["Lab Equipment", "Fume Hood"], "type": "Chemistry Lab"}
    ],
    timeSlots: [
        {"id": 1, "startTime": "09:00", "endTime": "10:00", "duration": 60},
        {"id": 2, "startTime": "10:00", "endTime": "11:00", "duration": 60},
        {"id": 3, "startTime": "11:00", "endTime": "12:00", "duration": 60},
        {"id": 4, "startTime": "14:00", "endTime": "15:00", "duration": 60},
        {"id": 5, "startTime": "15:00", "endTime": "16:00", "duration": 60},
        {"id": 6, "startTime": "16:00", "endTime": "17:30", "duration": 90}
    ],
    studentGroups: [
        {"id": 1, "name": "Group A", "size": 30, "program": "Engineering"},
        {"id": 2, "name": "Group B", "size": 25, "program": "Science"}
    ],
    students: [
        {"id": 1, "name": "Alice Brown", "rollNo": "2024001", "group": 1, "email": "alice@email.com"},
        {"id": 2, "name": "Bob Smith", "rollNo": "2024002", "group": 1, "email": "bob@email.com"},
        {"id": 3, "name": "Carol Davis", "rollNo": "2024003", "group": 2, "email": "carol@email.com"},
        {"id": 4, "name": "David Wilson", "rollNo": "2024004", "group": 2, "email": "david@email.com"},
        {"id": 5, "name": "Emma Johnson", "rollNo": "2024005", "group": 1, "email": "emma@email.com"},
        {"id": 6, "name": "Frank Miller", "rollNo": "2024006", "group": 1, "email": "frank@email.com"},
        {"id": 7, "name": "Grace Lee", "rollNo": "2024007", "group": 2, "email": "grace@email.com"},
        {"id": 8, "name": "Henry Wang", "rollNo": "2024008", "group": 2, "email": "henry@email.com"}
    ],
    attendanceData: [
        {"date": "2024-08-12", "class": "MATH101", "present": 28, "absent": 2, "late": 1},
        {"date": "2024-08-11", "class": "PHYS101", "present": 24, "absent": 1, "late": 0},
        {"date": "2024-08-10", "class": "CHEM101", "present": 23, "absent": 2, "late": 1}
    ],
    timetable: [],
    activities: []
};


// Global state
let currentModule = 'dashboard';
let currentTimetableSection = 'setup';
let currentAttendanceSection = 'mark';
let currentReportsSection = 'timetable-reports';
let generatedTimetable = {};
let attendanceRecords = {};
let charts = {};

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupEventListeners();
    updateDashboard();
    populateInitialData();
    startClock();
    setCurrentDate();
    // Delay chart initialization to ensure DOM is ready
    setTimeout(() => {
        initializeCharts();
    }, 500);
}

function setupEventListeners() {
    // Navigation tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            const tabName = e.target.getAttribute('data-tab');
            switchTab(tabName);
        });
    });

    // Timetable tabs
    document.querySelectorAll('.timetable-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            const section = e.target.getAttribute('data-section');
            switchTimetableSection(section);
        });
    });

    // Attendance tabs
    document.querySelectorAll('.attendance-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            const section = e.target.getAttribute('data-section');
            switchAttendanceSection(section);
        });
    });

    // Reports tabs
    document.querySelectorAll('.reports-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            const section = e.target.getAttribute('data-section');
            switchReportsSection(section);
        });
    });

    // Timetable generation
    const startGenerationBtn = document.getElementById('start-generation');
    if (startGenerationBtn) {
        startGenerationBtn.addEventListener('click', generateTimetable);
    }

    const generateTimetableBtn = document.getElementById('generate-timetable-btn');
    if (generateTimetableBtn) {
        generateTimetableBtn.addEventListener('click', () => {
            switchTab('timetable');
            setTimeout(() => switchTimetableSection('generation'), 100);
        });
    }

    // Modal close
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', closeModal);
    });

    // Click outside modal to close
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    });

    // Group selector change events
    const viewGroupSelect = document.getElementById('view-group-select');
    if (viewGroupSelect) {
        viewGroupSelect.addEventListener('change', displayTimetable);
    }

    const attendanceGroupSelect = document.getElementById('attendance-group-select');
    if (attendanceGroupSelect) {
        attendanceGroupSelect.addEventListener('change', displayStudentAttendanceList);
    }
}

// Navigation Functions
function switchTab(tabName) {
    console.log('Switching to tab:', tabName);
    
    // Update active nav tab
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }

    // Show corresponding module
    document.querySelectorAll('.module').forEach(module => {
        module.classList.remove('active');
    });
    
    const targetModule = document.getElementById(`${tabName}-module`);
    if (targetModule) {
        targetModule.classList.add('active');
    }

    currentModule = tabName;

    // Initialize module-specific content
    setTimeout(() => {
        if (tabName === 'attendance') {
            populateAttendanceData();
        } else if (tabName === 'reports') {
            generateReports();
        } else if (tabName === 'timetable') {
            populateTimetableData();
        }
    }, 100);
}

function switchTimetableSection(section) {
    console.log('Switching timetable section to:', section);
    
    document.querySelectorAll('.timetable-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    const activeTab = document.querySelector(`[data-section="${section}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }

    document.querySelectorAll('.timetable-section').forEach(sec => {
        sec.classList.remove('active');
    });
    
    const targetSection = document.getElementById(`${section}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    currentTimetableSection = section;

    setTimeout(() => {
        if (section === 'constraints') {
            populateConstraints();
        } else if (section === 'view') {
            displayTimetable();
            populateGroupSelectors();
        }
    }, 100);
}

function switchAttendanceSection(section) {
    console.log('Switching attendance section to:', section);
    
    document.querySelectorAll('.attendance-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    const activeTab = document.querySelector(`.attendance-tab[data-section="${section}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }

    document.querySelectorAll('.attendance-section').forEach(sec => {
        sec.classList.remove('active');
    });
    
    const targetSection = document.getElementById(`${section}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    currentAttendanceSection = section;

    setTimeout(() => {
        if (section === 'analytics') {
            updateAttendanceCharts();
        } else if (section === 'students') {
            displayStudents();
        }
    }, 100);
}

function switchReportsSection(section) {
    console.log('Switching reports section to:', section);
    
    document.querySelectorAll('.reports-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    const activeTab = document.querySelector(`.reports-tab[data-section="${section}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }

    document.querySelectorAll('.reports-section').forEach(sec => {
        sec.classList.remove('active');
    });
    
    const targetSection = document.getElementById(`${section}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    currentReportsSection = section;
}

// Dashboard Functions
function updateDashboard() {
    // Update metrics
    const totalClasses = generatedTimetable && Object.keys(generatedTimetable).length > 0 ? 15 : 0;
    document.getElementById('total-classes').textContent = totalClasses;
    document.getElementById('active-teachers').textContent = appData.teachers.length;
    document.getElementById('total-students').textContent = appData.students.length;
    
    // Calculate attendance rate
    const totalAttendance = appData.attendanceData.reduce((sum, record) => sum + record.present, 0);
    const totalPossible = appData.attendanceData.reduce((sum, record) => sum + record.present + record.absent + record.late, 0);
    const attendanceRate = totalPossible > 0 ? Math.round((totalAttendance / totalPossible) * 100) : 0;
    document.getElementById('attendance-rate').textContent

    // Update today's schedule
    updateTodaysSchedule();
    
    // Update recent activities
    updateRecentActivities();
}

function updateTodaysSchedule() {
    const scheduleList = document.getElementById('schedule-list');
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    
    // Sample schedule for today
    const todaysSchedule = [
        { time: '09:00 - 10:00', subject: 'Mathematics', teacher: 'Dr. Sarah Johnson', room: 'Room A101' },
        { time: '10:00 - 11:00', subject: 'Physics', teacher: 'Prof. Michael Chen', room: 'Room A101' },
        { time: '14:00 - 15:00', subject: 'Chemistry', teacher: 'Dr. Emily Davis', room: 'Room C103' }
    ];

    scheduleList.innerHTML = todaysSchedule.map(item => `
        <div class="schedule-item">
            <div>
                <div class="schedule-time">${item.time}</div>
                <div>${item.subject} - ${item.teacher}</div>
                <div style="font-size: 12px; color: var(--color-text-secondary);">${item.room}</div>
            </div>
            <button class="btn btn--sm btn--outline" onclick="switchTab('attendance')">Mark Attendance</button>
        </div>
    `).join('');
}

function updateRecentActivities() {
    const activityList = document.getElementById('activity-list');
    const activities = appData.activities.length > 0 ? appData.activities.map(a => a.text) : [
        'System initialized successfully',
        'Sample data loaded',
        'Dashboard updated',
        'Charts initialized',
        'Ready for timetable generation'
    ];

    activityList.innerHTML = activities.slice(0, 5).map(activity => `
        <div class="activity-item">${activity}</div>
    `).join('');
}

function startClock() {
    function updateClock() {
        const now = new Date();
        const currentDate = now.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        const currentTime = now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
        });

        const dateEl = document.getElementById('current-date');
        const timeEl = document.getElementById('current-time');
        
        if (dateEl) dateEl.textContent = currentDate;
        if (timeEl) timeEl.textContent = currentTime;
    }

    updateClock();
    setInterval(updateClock, 1000);
}

function setCurrentDate() {
    const today = new Date().toISOString().split('T')[0];
    const attendanceDateEl = document.getElementById('attendance-date');
    const reportStartEl = document.getElementById('report-start-date');
    const reportEndEl = document.getElementById('report-end-date');
    
    if (attendanceDateEl) attendanceDateEl.value = today;
    if (reportStartEl) reportStartEl.value = new Date(Date.now() - 7*24*60*60*1000).toISOString().split('T')[0];
    if (reportEndEl) reportEndEl.value = today;
}

// Timetable Management Functions
function populateInitialData() {
    displaySubjects();
    displayTeachers();
    displayRooms();
    displayGroups();
    populateSelectors();
}

function populateTimetableData() {
    displaySubjects();
    displayTeachers();
    displayRooms();
    displayGroups();
    populateSelectors();
}

function displaySubjects() {
    const container = document.getElementById('subjects-list');
    if (!container) return;
    
    container.innerHTML = appData.subjects.map(subject => `
        <div class="data-item">
            <div class="data-item-info">
                <div class="data-item-name">${subject.name} (${subject.code})</div>
                <div class="data-item-details">${subject.credits} credits, ${subject.duration}min</div>
            </div>
            <div class="data-item-actions">
                <button class="btn-icon" onclick="editSubject(${subject.id})">✏️</button>
                <button class="btn-icon" onclick="deleteSubject(${subject.id})">🗑️</button>
            </div>
        </div>
    `).join('');
}

function displayTeachers() {
    const container = document.getElementById('teachers-list');
    if (!container) return;
    
    container.innerHTML = appData.teachers.map(teacher => `
        <div class="data-item">
            <div class="data-item-info">
                <div class="data-item-name">${teacher.name}</div>
                <div class="data-item-details">${teacher.specialization}, Max: ${teacher.maxHours}h/week</div>
            </div>
            <div class="data-item-actions">
                <button class="btn-icon" onclick="editTeacher(${teacher.id})">✏️</button>
                <button class="btn-icon" onclick="deleteTeacher(${teacher.id})">🗑️</button>
            </div>
        </div>
    `).join('');
}

function displayRooms() {
    const container = document.getElementById('rooms-list');
    if (!container) return;
    
    container.innerHTML = appData.classrooms.map(room => `
        <div class="data-item">
            <div class="data-item-info">
                <div class="data-item-name">${room.name}</div>
                <div class="data-item-details">${room.type}, Capacity: ${room.capacity}</div>
            </div>
            <div class="data-item-actions">
                <button class="btn-icon" onclick="editRoom(${room.id})">✏️</button>
                <button class="btn-icon" onclick="deleteRoom(${room.id})">🗑️</button>
            </div>
        </div>
    `).join('');
}

function displayGroups() {
    const container = document.getElementById('groups-list');
    if (!container) return;
    
    container.innerHTML = appData.studentGroups.map(group => `
        <div class="data-item">
            <div class="data-item-info">
                <div class="data-item-name">${group.name}</div>
                <div class="data-item-details">${group.program}, Size: ${group.size}</div>
            </div>
            <div class="data-item-actions">
                <button class="btn-icon" onclick="editGroup(${group.id})">✏️</button>
                <button class="btn-icon" onclick="deleteGroup(${group.id})">🗑️</button>
            </div>
        </div>
    `).join('');
}

// CRUD Functions
function addSubject() {
    const name = document.getElementById('subject-name').value;
    const code = document.getElementById('subject-code').value;
    const credits = parseInt(document.getElementById('subject-credits').value);
    const duration = parseInt(document.getElementById('subject-duration').value);

    if (name && code && credits && duration) {
        const newSubject = {
            id: Math.max(...appData.subjects.map(s => s.id), 0) + 1,
            name, code, credits, duration
        };
        appData.subjects.push(newSubject);
        displaySubjects();
        clearSubjectForm();
        addActivity(`Subject ${name} added`);
    }
}

function addTeacher() {
    const name = document.getElementById('teacher-name').value;
    const specialization = document.getElementById('teacher-specialization').value;
    const maxHours = parseInt(document.getElementById('teacher-max-hours').value);

    if (name && specialization && maxHours) {
        const newTeacher = {
            id: Math.max(...appData.teachers.map(t => t.id), 0) + 1,
            name, specialization, maxHours,
            availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
        };
        appData.teachers.push(newTeacher);
        displayTeachers();
        clearTeacherForm();
        addActivity(`Teacher ${name} added`);
    }
}

function addRoom() {
    const name = document.getElementById('room-name').value;
    const capacity = parseInt(document.getElementById('room-capacity').value);
    const type = document.getElementById('room-type').value;

    if (name && capacity && type) {
        const newRoom = {
            id: Math.max(...appData.classrooms.map(r => r.id), 0) + 1,
            name, capacity, type,
            equipment: ['Projector', 'Whiteboard']
        };
        appData.classrooms.push(newRoom);
        displayRooms();
        clearRoomForm();
        addActivity(`Room ${name} added`);
    }
}

function addGroup() {
    const name = document.getElementById('group-name').value;
    const size = parseInt(document.getElementById('group-size').value);
    const program = document.getElementById('group-program').value;

    if (name && size && program) {
        const newGroup = {
            id: Math.max(...appData.studentGroups.map(g => g.id), 0) + 1,
            name, size, program
        };
        appData.studentGroups.push(newGroup);
        displayGroups();
        clearGroupForm();
        addActivity(`Group ${name} added`);
    }
}

function clearSubjectForm() {
    document.getElementById('subject-name').value = '';
    document.getElementById('subject-code').value = '';
    document.getElementById('subject-credits').value = '';
    document.getElementById('subject-duration').value = '';
}

function clearTeacherForm() {
    document.getElementById('teacher-name').value = '';
    document.getElementById('teacher-specialization').value = '';
    document.getElementById('teacher-max-hours').value = '';
}

function clearRoomForm() {
    document.getElementById('room-name').value = '';
    document.getElementById('room-capacity').value = '';
    document.getElementById('room-type').value = '';
}

function clearGroupForm() {
    document.getElementById('group-name').value = '';
    document.getElementById('group-size').value = '';
    document.getElementById('group-program').value = '';
}

function deleteSubject(id) {
    if (confirm('Are you sure you want to delete this subject?')) {
        appData.subjects = appData.subjects.filter(s => s.id !== id);
        displaySubjects();
        addActivity('Subject deleted');
    }
}

function deleteTeacher(id) {
    if (confirm('Are you sure you want to delete this teacher?')) {
        appData.teachers = appData.teachers.filter(t => t.id !== id);
        displayTeachers();
        addActivity('Teacher deleted');
    }
}

function deleteRoom(id) {
    if (confirm('Are you sure you want to delete this room?')) {
        appData.classrooms = appData.classrooms.filter(r => r.id !== id);
        displayRooms();
        addActivity('Room deleted');
    }
}

function deleteGroup(id) {
    if (confirm('Are you sure you want to delete this group?')) {
        appData.studentGroups = appData.studentGroups.filter(g => g.id !== id);
        displayGroups();
        addActivity('Group deleted');
    }
}

// Timetable Generation
function generateTimetable() {
    const algorithm = document.getElementById('algorithm-select').value;
    const progressSection = document.getElementById('generation-progress');
    const progressFill = progressSection.querySelector('.progress-fill');
    const progressText = progressSection.querySelector('.progress-text');

    progressSection.classList.remove('hidden');
    let progress = 0;

    const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress > 100) progress = 100;

        progressFill.style.width = `${progress}%`;
        
        if (progress < 30) {
            progressText.textContent = 'Analyzing constraints...';
        } else if (progress < 60) {
            progressText.textContent = 'Optimizing schedule...';
        } else if (progress < 90) {
            progressText.textContent = 'Resolving conflicts...';
        } else {
            progressText.textContent = 'Finalizing timetable...';
        }

        if (progress >= 100) {
            clearInterval(interval);
            progressText.textContent = 'Timetable generated successfully!';
            setTimeout(() => {
                progressSection.classList.add('hidden');
                createSampleTimetable();
                switchTimetableSection('view');
                addActivity('Timetable generated successfully');
                updateDashboard();
            }, 1000);
        }
    }, 200);
}

function createSampleTimetable() {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    generatedTimetable = {};

    appData.studentGroups.forEach(group => {
        generatedTimetable[group.id] = {};
        
        days.forEach(day => {
            generatedTimetable[group.id][day] = {};
            
            // Sample timetable generation
            const daySubjects = appData.subjects.slice(0, 3); // First 3 subjects per day
            daySubjects.forEach((subject, index) => {
                const timeSlot = appData.timeSlots[index];
                const teacher = appData.teachers.find(t => 
                    t.specialization.toLowerCase().includes(subject.name.toLowerCase()) ||
                    subject.name.toLowerCase().includes(t.specialization.toLowerCase())
                ) || appData.teachers[0];
                const room = appData.classrooms[index % appData.classrooms.length];
                
                generatedTimetable[group.id][day][timeSlot.startTime] = {
                    subject: subject,
                    teacher: teacher,
                    room: room,
                    timeSlot: timeSlot
                };
            });
        });
    });
}

function displayTimetable() {
    const grid = document.getElementById('timetable-grid');
    if (!grid) return;
    
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    
    let html = `
        <div class="timetable-header">
            <div class="timetable-header-cell">Time</div>
            ${days.map(day => `<div class="timetable-header-cell">${day}</div>`).join('')}
        </div>
    `;

    appData.timeSlots.forEach(timeSlot => {
        html += `<div class="timetable-row">
            <div class="timetable-time-cell">${timeSlot.startTime}<br>${timeSlot.endTime}</div>
            ${days.map(day => {
                const selectedGroup = document.getElementById('view-group-select').value;
                let cellContent = '';
                
                if (selectedGroup && generatedTimetable[selectedGroup] && generatedTimetable[selectedGroup][day] && generatedTimetable[selectedGroup][day][timeSlot.startTime]) {
                    const classInfo = generatedTimetable[selectedGroup][day][timeSlot.startTime];
                    cellContent = `
                        <div class="timetable-class">
                            <div class="class-subject">${classInfo.subject.name}</div>
                            <div class="class-teacher">${classInfo.teacher.name}</div>
                            <div class="class-teacher">${classInfo.room.name}</div>
                        </div>
                    `;
                }
                
                return `<div class="timetable-cell">${cellContent}</div>`;
            }).join('')}
        </div>`;
    });

    grid.innerHTML = html;
}

function populateGroupSelectors() {
    const selectors = ['view-group-select', 'attendance-group-select', 'modal-student-group'];
    
    selectors.forEach(selectorId => {
        const selector = document.getElementById(selectorId);
        if (selector) {
            const currentValue = selector.value;
            selector.innerHTML = '<option value="">Select Group</option>' +
                appData.studentGroups.map(group => 
                    `<option value="${group.id}" ${currentValue == group.id ? 'selected' : ''}>${group.name}</option>`
                ).join('');
        }
    });
}

function populateSelectors() {
    populateGroupSelectors();
    
    // Populate class selector for attendance
    const classSelector = document.getElementById('class-select');
    if (classSelector) {
        classSelector.innerHTML = '<option value="">Choose a class</option>' +
            appData.subjects.map(subject => 
                `<option value="${subject.code}">${subject.name} (${subject.code})</option>`
            ).join('');
    }

    // Populate analytics subject selector
    const analyticsSelector = document.getElementById('analytics-subject');
    if (analyticsSelector) {
        analyticsSelector.innerHTML = '<option value="">All Subjects</option>' +
            appData.subjects.map(subject => 
                `<option value="${subject.code}">${subject.name}</option>`
            ).join('');
    }
}

function populateConstraints() {
    // Teacher availability
    const teacherAvailability = document.getElementById('teacher-availability-list');
    if (teacherAvailability) {
        teacherAvailability.innerHTML = appData.teachers.map(teacher => `
            <div class="data-item">
                <div class="data-item-info">
                    <div class="data-item-name">${teacher.name}</div>
                    <div class="data-item-details">Available: ${teacher.availability.join(', ')}</div>
                </div>
            </div>
        `).join('');
    }

    // Room requirements
    const roomRequirements = document.getElementById('room-requirements-list');
    if (roomRequirements) {
        roomRequirements.innerHTML = appData.classrooms.map(room => `
            <div class="data-item">
                <div class="data-item-info">
                    <div class="data-item-name">${room.name}</div>
                    <div class="data-item-details">Capacity: ${room.capacity}, Type: ${room.type}</div>
                </div>
            </div>
        `).join('');
    }

    // Subject frequency
    const subjectFrequency = document.getElementById('subject-frequency-list');
    if (subjectFrequency) {
        subjectFrequency.innerHTML = appData.subjects.map(subject => `
            <div class="data-item">
                <div class="data-item-info">
                    <div class="data-item-name">${subject.name}</div>
                    <div class="data-item-details">Suggested: ${Math.ceil(subject.credits / 2)} times/week</div>
                </div>
            </div>
        `).join('');
    }
}

// Attendance Functions (Enhanced with Supabase integration)
function populateAttendanceData() {
    populateSelectors();
    // Initialize attendance manager if it exists
    if (window.attendanceManager) {
        window.attendanceManager.loadClasses();
        window.attendanceManager.loadStudentGroups();
    }
}

// Legacy functions for backward compatibility
function generateQRCode() {
    if (window.attendanceManager) {
        window.attendanceManager.generateQRCode();
    } else {
        // Fallback to original implementation
        document.getElementById('qr-code-section').classList.remove('hidden');
        document.getElementById('manual-attendance-section').classList.add('hidden');
        
        // Simulate QR code scanning
        let scannedCount = 0;
        const maxStudents = 30;
        
        const interval = setInterval(() => {
            scannedCount += Math.floor(Math.random() * 3) + 1;
            if (scannedCount > maxStudents) scannedCount = maxStudents;
            
            document.getElementById('qr-scanned').textContent = scannedCount;
            
            if (scannedCount >= maxStudents) {
                clearInterval(interval);
            }
        }, 1000);
    }
}

function showManualAttendance() {
    if (window.attendanceManager) {
        window.attendanceManager.showManualAttendance();
    } else {
        // Fallback to original implementation
        document.getElementById('manual-attendance-section').classList.remove('hidden');
        document.getElementById('qr-code-section').classList.add('hidden');
        
        displayStudentAttendanceList();
    }
}

function saveAttendance() {
    if (window.attendanceManager) {
        window.attendanceManager.saveAttendance();
    } else {
        // Fallback to original implementation
        const selectedClass = document.getElementById('class-select').value;
        const selectedGroup = document.getElementById('attendance-group-select').value;
        const date = document.getElementById('attendance-date').value;
        
        if (selectedClass && selectedGroup && date) {
            addActivity(`Attendance saved for ${selectedClass} on ${date}`);
            alert('Attendance saved successfully!');
            
            // Update attendance data
            const presentCount = Object.values(attendanceRecords).filter(records => 
                records[date] === 'present'
            ).length || Math.floor(Math.random() * 5) + 25;
            
            appData.attendanceData.push({
                date: date,
                class: selectedClass,
                present: presentCount,
                absent: 2,
                late: 1
            });
            
            updateDashboard();
        } else {
            alert('Please select class, group, and date before saving.');
        }
    }
}

// Student search functionality
function filterStudents() {
    const searchTerm = document.getElementById('student-search').value.toLowerCase();
    const studentItems = document.querySelectorAll('.student-attendance-item');
    
    studentItems.forEach(item => {
        const studentName = item.querySelector('.student-name').textContent.toLowerCase();
        const studentId = item.querySelector('.student-id').textContent.toLowerCase();
        const studentEmail = item.querySelector('.student-email').textContent.toLowerCase();
        
        if (studentName.includes(searchTerm) || studentId.includes(searchTerm) || studentEmail.includes(searchTerm)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

function displayStudentAttendanceList() {
    const selectedGroup = document.getElementById('attendance-group-select').value;
    const container = document.getElementById('students-attendance-list');
    
    if (!selectedGroup || !container) {
        if (container) container.innerHTML = '<p>Please select a group to view students.</p>';
        return;
    }
    
    const groupStudents = appData.students.filter(s => s.group == selectedGroup);
    
    container.innerHTML = groupStudents.map(student => `
        <div class="student-attendance-item">
            <div class="student-info">
                <div class="student-avatar">${student.name.charAt(0)}</div>
                <div>
                    <div class="data-item-name">${student.name}</div>
                    <div class="data-item-details">Roll: ${student.rollNo}</div>
                </div>
            </div>
            <div class="attendance-controls-student">
                <button class="attendance-btn" onclick="markAttendance(${student.id}, 'present')">Present</button>
                <button class="attendance-btn" onclick="markAttendance(${student.id}, 'absent')">Absent</button>
                <button class="attendance-btn" onclick="markAttendance(${student.id}, 'late')">Late</button>
            </div>
        </div>
    `).join('');
}

function markAttendance(studentId, status) {
    const buttons = event.target.parentElement.querySelectorAll('.attendance-btn');
    buttons.forEach(btn => btn.classList.remove('present', 'absent', 'late'));
    event.target.classList.add(status);
    
    // Store attendance data
    if (!attendanceRecords[studentId]) {
        attendanceRecords[studentId] = {};
    }
    attendanceRecords[studentId][new Date().toISOString().split('T')[0]] = status;
}

function markAllPresent() {
    if (window.attendanceManager) {
        window.attendanceManager.markAllPresent();
    } else {
        // Fallback implementation
        document.querySelectorAll('.attendance-controls-student').forEach(controls => {
            const presentBtn = controls.querySelector('.attendance-btn');
            if (presentBtn) presentBtn.click();
        });
    }
}

function markPreviousPattern() {
    // Simulate using previous attendance pattern
    const buttons = document.querySelectorAll('.attendance-controls-student');
    buttons.forEach((controls, index) => {
        const status = Math.random() > 0.1 ? 'present' : (Math.random() > 0.5 ? 'late' : 'absent');
        const targetBtn = controls.children[status === 'present' ? 0 : (status === 'absent' ? 1 : 2)];
        if (targetBtn) targetBtn.click();
    });
}

function bulkUpload() {
    alert('Bulk upload feature: Select a CSV file with student attendance data.\n\nFormat: Student ID, Status (Present/Absent/Late)');
}

// Student Management
function displayStudents() {
    const container = document.getElementById('students-grid');
    if (!container) return;
    
    container.innerHTML = appData.students.map(student => {
        const group = appData.studentGroups.find(g => g.id === student.group);
        const attendanceRate = Math.floor(Math.random() * 20) + 80; // Simulate attendance rate
        
        return `
            <div class="student-card">
                <div class="student-card-header">
                    <div class="student-card-avatar">${student.name.charAt(0)}</div>
                    <div class="student-card-info">
                        <h4>${student.name}</h4>
                        <div class="student-card-details">Roll: ${student.rollNo}</div>
                        <div class="student-card-details">Group: ${group ? group.name : 'N/A'}</div>
                        <div class="student-card-details">${student.email}</div>
                    </div>
                </div>
                <div class="student-attendance-rate">
                    <strong>Attendance: ${attendanceRate}%</strong>
                </div>
            </div>
        `;
    }).join('');
}

function addNewStudent() {
    populateGroupSelectors(); // Ensure group options are populated
    document.getElementById('student-modal').classList.remove('hidden');
}

function saveStudent() {
    const name = document.getElementById('modal-student-name').value;
    const rollNo = document.getElementById('modal-student-roll').value;
    const email = document.getElementById('modal-student-email').value;
    const group = parseInt(document.getElementById('modal-student-group').value);

    if (name && rollNo && email && group) {
        const newStudent = {
            id: Math.max(...appData.students.map(s => s.id), 0) + 1,
            name, rollNo, email, group
        };
        appData.students.push(newStudent);
        displayStudents();
        closeModal();
        addActivity(`Student ${name} added`);
        updateDashboard();
    } else {
        alert('Please fill in all fields.');
    }
}

function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.add('hidden');
    });
    
    // Clear form fields
    document.getElementById('modal-student-name').value = '';
    document.getElementById('modal-student-roll').value = '';
    document.getElementById('modal-student-email').value = '';
    document.getElementById('modal-student-group').value = '';
}

// Charts and Analytics
function initializeCharts() {
    createAttendanceRateChart();
    createDailyTrendsChart();
    createSubjectAttendanceChart();
    createTeacherWorkloadChart();
    createRoomUtilizationChart();
}

function createAttendanceRateChart() {
    const ctx = document.getElementById('attendance-rate-chart');
    if (!ctx || !window.Chart) return;
    
    if (charts.attendanceRate) {
        charts.attendanceRate.destroy();
    }
    
    try {
        charts.attendanceRate = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Present', 'Absent', 'Late'],
                datasets: [{
                    data: [85, 10, 5],
                    backgroundColor: ['#1FB8CD', '#B4413C', '#FFC185']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error creating attendance rate chart:', error);
    }
}

function createDailyTrendsChart() {
    const ctx = document.getElementById('daily-trends-chart');
    if (!ctx || !window.Chart) return;
    
    if (charts.dailyTrends) {
        charts.dailyTrends.destroy();
    }
    
    try {
        charts.dailyTrends = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
                datasets: [{
                    label: 'Attendance %',
                    data: [88, 92, 85, 90, 87],
                    borderColor: '#1FB8CD',
                    backgroundColor: 'rgba(31, 184, 205, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error creating daily trends chart:', error);
    }
}

function createSubjectAttendanceChart() {
    const ctx = document.getElementById('subject-attendance-chart');
    if (!ctx || !window.Chart) return;
    
    if (charts.subjectAttendance) {
        charts.subjectAttendance.destroy();
    }
    
    try {
        charts.subjectAttendance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Math', 'Physics', 'Chemistry', 'English', 'CS'],
                datasets: [{
                    label: 'Attendance %',
                    data: [92, 88, 85, 95, 90],
                    backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error creating subject attendance chart:', error);
    }
}

function createTeacherWorkloadChart() {
    const ctx = document.getElementById('teacher-workload-chart');
    if (!ctx || !window.Chart) return;
    
    if (charts.teacherWorkload) {
        charts.teacherWorkload.destroy();
    }
    
    try {
        const teacherNames = appData.teachers.map(t => t.name.split(' ').slice(-1)[0]);
        const workloadData = appData.teachers.map(t => Math.floor(Math.random() * t.maxHours));
        
        charts.teacherWorkload = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: teacherNames,
                datasets: [{
                    label: 'Hours/Week',
                    data: workloadData,
                    backgroundColor: '#1FB8CD'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y'
            }
        });
    } catch (error) {
        console.error('Error creating teacher workload chart:', error);
    }
}

function createRoomUtilizationChart() {
    const ctx = document.getElementById('room-utilization-chart');
    if (!ctx || !window.Chart) return;
    
    if (charts.roomUtilization) {
        charts.roomUtilization.destroy();
    }
    
    try {
        charts.roomUtilization = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: appData.classrooms.map(r => r.name),
                datasets: [{
                    data: [75, 68, 82],
                    backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error creating room utilization chart:', error);
    }
}

function updateAttendanceCharts() {
    setTimeout(() => {
        createAttendanceRateChart();
        createDailyTrendsChart();
        createSubjectAttendanceChart();
        
        // Update alerts
        const alertsContainer = document.getElementById('attendance-alerts');
        if (alertsContainer) {
            alertsContainer.innerHTML = `
                <div class="alert-item">John Doe - Attendance below 75% (68%)</div>
                <div class="alert-item">Math101 - Class average below threshold (72%)</div>
                <div class="alert-item">Group B - 5 consecutive absences detected</div>
            `;
        }
    }, 100);
}

// Reports Functions
function generateReports() {
    setTimeout(() => {
        createTeacherWorkloadChart();
        createRoomUtilizationChart();
        generateConflictsList();
        generateEmptySlotsList();
        generateStudentSummaryTable();
        generateDefaultersList();
        updateAnalyticsOverview();
    }, 100);
}

function generateConflictsList() {
    const container = document.getElementById('conflicts-list');
    if (!container) return;
    
    const conflicts = [
        'Dr. Sarah Johnson: Double booking on Monday 10:00 AM',
        'Room A101: Capacity exceeded for CS101 (35 students, capacity 30)',
        'Group A: Overlapping classes - Math and Physics at 2:00 PM'
    ];
    
    container.innerHTML = conflicts.map(conflict => 
        `<div class="alert-item">${conflict}</div>`
    ).join('');
}

function generateEmptySlotsList() {
    const container = document.getElementById('empty-slots-list');
    if (!container) return;
    
    const emptySlots = [
        'Monday 11:00 AM - Room C103 available',
        'Wednesday 3:00 PM - All rooms available',
        'Friday 4:00 PM - Room B205 available'
    ];
    
    container.innerHTML = emptySlots.map(slot => 
        `<div class="data-item"><div class="data-item-name">${slot}</div></div>`
    ).join('');
}

function generateStudentSummaryTable() {
    const container = document.getElementById('student-summary-table');
    if (!container) return;
    
    let html = `
        <div class="summary-table-row summary-table-header">
            <div>Student Name</div>
            <div>Total Classes</div>
            <div>Present</div>
            <div>Attendance %</div>
        </div>
    `;
    
    appData.students.slice(0, 10).forEach(student => {
        const totalClasses = 25;
        const present = Math.floor(Math.random() * 5) + 20;
        const percentage = Math.round((present / totalClasses) * 100);
        
        html += `
            <div class="summary-table-row">
                <div>${student.name}</div>
                <div>${totalClasses}</div>
                <div>${present}</div>
                <div class="${percentage < 75 ? 'text-error' : 'text-success'}">${percentage}%</div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function generateDefaultersList() {
    const container = document.getElementById('defaulters-list');
    if (!container) return;
    
    const defaulters = [
        { name: 'John Doe', attendance: '68%', absences: 8 },
        { name: 'Jane Smith', attendance: '72%', absences: 7 },
        { name: 'Bob Johnson', attendance: '74%', absences: 6 }
    ];
    
    container.innerHTML = defaulters.map(student => `
        <div class="alert-item">
            ${student.name} - ${student.attendance} attendance, ${student.absences} absences
        </div>
    `).join('');
}

function updateAnalyticsOverview() {
    const totalHoursEl = document.getElementById('total-scheduled-hours');
    const avgAttendanceEl = document.getElementById('avg-attendance');
    const peakDayEl = document.getElementById('peak-attendance-day');
    
    if (totalHoursEl) totalHoursEl.textContent = '120';
    if (avgAttendanceEl) avgAttendanceEl.textContent = '87%';
    if (peakDayEl) peakDayEl.textContent = 'Tuesday';
}

// Settings Functions
function saveSettings() {
    const institutionName = document.getElementById('institution-name').value;
    const academicYear = document.getElementById('academic-year').value;
    const semester = document.getElementById('current-semester').value;
    const defaultAlgorithm = document.getElementById('default-algorithm').value;
    const attendanceThreshold = document.getElementById('attendance-threshold').value;
    const autosaveInterval = document.getElementById('autosave-interval').value;

    // Simulate saving settings
    addActivity('Settings updated successfully');
    alert('Settings saved successfully!');
}

function exportData() {
    try {
        const dataStr = JSON.stringify(appData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = 'hh310_data.json';
        link.click();
        
        addActivity('Data exported successfully');
    } catch (error) {
        alert('Error exporting data: ' + error.message);
    }
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedData = JSON.parse(e.target.result);
                    appData = importedData;
                    populateInitialData();
                    updateDashboard();
                    addActivity('Data imported successfully');
                    alert('Data imported successfully!');
                } catch (error) {
                    alert('Error importing data. Please check the file format.');
                }
            };
            reader.readAsText(file);
        }
    };
    input.click();
}

function backupData() {
    exportData();
    addActivity('System backup created');
    alert('System backup created and downloaded!');
}

function exportTimetable() {
    alert('Timetable export: This would generate a PDF of the current timetable.');
    addActivity('Timetable exported to PDF');
}

function printTimetable() {
    window.print();
    addActivity('Timetable sent to printer');
}

// Authentication Integration
function checkUserAuthentication() {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (!token || !isValidToken(token)) {
        // Redirect to login if not authenticated
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

function isValidToken(token) {
    // Simple token validation (replace with actual JWT validation)
    return token && token.startsWith('mock-jwt-token-');
}

// Modal Functions
function loginUser() {
    // This function can be called if login modal is used instead of separate page
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    if (!email || !password) {
        alert('Please fill in all fields');
        return;
    }
    
    // Redirect to login page for better UX
    window.location.href = 'login.html';
}

function signupUser() {
    // This function can be called if signup modal is used instead of separate page
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const role = document.getElementById('signup-role').value;
    
    if (!name || !email || !password || !role) {
        alert('Please fill in all fields');
        return;
    }
    
    // Redirect to login page for better UX
    window.location.href = 'login.html?form=signup';
}

// Edit functions (placeholder implementations)
function editSubject(id) {
    const subject = appData.subjects.find(s => s.id === id);
    if (subject) {
        document.getElementById('subject-name').value = subject.name;
        document.getElementById('subject-code').value = subject.code;
        document.getElementById('subject-credits').value = subject.credits;
        document.getElementById('subject-duration').value = subject.duration;
    }
}

function editTeacher(id) {
    const teacher = appData.teachers.find(t => t.id === id);
    if (teacher) {
        document.getElementById('teacher-name').value = teacher.name;
        document.getElementById('teacher-specialization').value = teacher.specialization;
        document.getElementById('teacher-max-hours').value = teacher.maxHours;
    }
}

function editRoom(id) {
    const room = appData.classrooms.find(r => r.id === id);
    if (room) {
        document.getElementById('room-name').value = room.name;
        document.getElementById('room-capacity').value = room.capacity;
        document.getElementById('room-type').value = room.type;
    }
}

function editGroup(id) {
    const group = appData.studentGroups.find(g => g.id === id);
    if (group) {
        document.getElementById('group-name').value = group.name;
        document.getElementById('group-size').value = group.size;
        document.getElementById('group-program').value = group.program;
    }
}

// Make functions globally available
window.switchTab = switchTab;
window.switchTimetableSection = switchTimetableSection;
window.switchAttendanceSection = switchAttendanceSection;
window.switchReportsSection = switchReportsSection;
window.addSubject = addSubject;
window.addTeacher = addTeacher;
window.addRoom = addRoom;
window.addGroup = addGroup;
window.deleteSubject = deleteSubject;
window.deleteTeacher = deleteTeacher;
window.deleteRoom = deleteRoom;
window.deleteGroup = deleteGroup;
window.editSubject = editSubject;
window.editTeacher = editTeacher;
window.editRoom = editRoom;
window.editGroup = editGroup;
window.generateQRCode = generateQRCode;
window.showManualAttendance = showManualAttendance;
window.markAttendance = markAttendance;
window.markAllPresent = markAllPresent;
window.markPreviousPattern = markPreviousPattern;
window.saveAttendance = saveAttendance;
window.bulkUpload = bulkUpload;
window.addNewStudent = addNewStudent;
window.saveStudent = saveStudent;
window.closeModal = closeModal;
window.saveSettings = saveSettings;
window.exportData = exportData;
window.importData = importData;
window.backupData = backupData;
window.exportTimetable = exportTimetable;
window.printTimetable = printTimetable;

// Authentication and Navigation Functions
let currentUser = null;
let authDropdownVisible = false;

// Toggle authentication dropdown
function toggleAuthDropdown() {
    console.log('Toggle auth dropdown called'); // Debug log
    const dropdown = document.getElementById('auth-dropdown');
    const menu = document.getElementById('auth-dropdown-menu');
    
    if (dropdown && menu) {
        const isShown = menu.classList.contains('show');
        console.log('Dropdown currently shown:', isShown); // Debug log
        
        if (isShown) {
            dropdown.classList.remove('active');
            menu.classList.remove('show');
            document.removeEventListener('click', handleClickOutside);
        } else {
            dropdown.classList.add('active');
            menu.classList.add('show');
            // Add click outside to close functionality
            setTimeout(() => {
                document.addEventListener('click', handleClickOutside);
            }, 0);
        }
    } else {
        console.error('Dropdown elements not found'); // Debug log
    }
}

function handleClickOutside(event) {
    const dropdown = document.getElementById('auth-dropdown');
    if (dropdown && !dropdown.contains(event.target)) {
        closeAuthDropdown();
        document.removeEventListener('click', handleClickOutside);
    }
}

function closeAuthDropdown() {
    const dropdown = document.getElementById('auth-dropdown');
    const menu = document.getElementById('auth-dropdown-menu');
    
    if (dropdown && menu) {
        dropdown.classList.remove('active');
        menu.classList.remove('show');
    }
}

// Redirect to login page
function redirectToLogin(mode = 'login') {
    console.log('Redirect to login called with mode:', mode); // Debug log
    closeAuthDropdown();
    
    // Show loading state
    const authBtn = document.getElementById('auth-btn');
    if (authBtn) {
        authBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        authBtn.disabled = true;
    }

    // Add small delay to ensure dropdown closes smoothly
    setTimeout(function() {
        console.log('Redirecting to:', `login.html?form=${mode}`); // Debug log
        window.location.href = `login.html?form=${mode}`;
    }, 300);
}

// Check authentication status
async function checkAuthStatus() {
    try {
        if (typeof window.supabaseClient !== 'undefined') {
            const { data: { session }, error } = await window.supabaseClient.auth.getSession();
            
            if (error) {
                console.error('Error checking auth status:', error);
                return false;
            }
            
            if (session && session.user) {
                currentUser = session.user;
                showUserMenu(session.user);
                return true;
            }
        }
        
        showAuthButtons();
        return false;
    } catch (error) {
        console.error('Error in checkAuthStatus:', error);
        showAuthButtons();
        return false;
    }
}

// Show user menu when authenticated
function showUserMenu(user) {
    const authDropdown = document.getElementById('auth-dropdown');
    const userMenu = document.getElementById('user-menu');
    const userNameEl = document.getElementById('user-name');
    const userAvatarEl = document.getElementById('user-avatar');
    
    if (authDropdown) authDropdown.style.display = 'none';
    if (userMenu) userMenu.classList.remove('hidden');
    
    if (userNameEl) {
        userNameEl.textContent = user.user_metadata?.full_name || 
                                 user.user_metadata?.first_name || 
                                 user.email?.split('@')[0] || 
                                 'User';
    }
    
    if (userAvatarEl && user.user_metadata?.avatar_url) {
        userAvatarEl.src = user.user_metadata.avatar_url;
    }
}

// Show authentication buttons when not authenticated
function showAuthButtons() {
    const authDropdown = document.getElementById('auth-dropdown');
    const userMenu = document.getElementById('user-menu');
    
    if (authDropdown) authDropdown.style.display = 'block';
    if (userMenu) userMenu.classList.add('hidden');
}

// Show user profile modal/page
function showProfile() {
    // For now, just show an alert - can be expanded to show a profile modal
    alert('Profile functionality will be implemented in a future update.');
    // TODO: Implement profile modal or redirect to profile page
}

// Show settings modal/page
function showSettings() {
    // Switch to settings tab
    switchTab('settings');
}

// Logout function
async function logout() {
    try {
        if (typeof window.supabaseClient !== 'undefined') {
            const { error } = await window.supabaseClient.auth.signOut();
            
            if (error) {
                console.error('Error during logout:', error);
                alert('Error during logout. Please try again.');
                return;
            }
        }
        
        // Clear current user
        currentUser = null;
        
        // Clear any stored authentication data
        localStorage.removeItem('authType');
        
        // Show auth buttons
        showAuthButtons();
        
        // Optional: Redirect to login page
        // window.location.href = 'login.html';
        
        console.log('✅ Successfully logged out');
    } catch (error) {
        console.error('Error during logout:', error);
        alert('Error during logout. Please try again.');
    }
}

// Initialize authentication on page load
function initializeAuth() {
    // Check if user is already authenticated
    checkAuthStatus();
    
    // Listen for auth state changes
    if (typeof window.supabaseClient !== 'undefined') {
        window.supabaseClient.auth.onAuthStateChange((event, session) => {
            console.log('Auth state changed:', event, session);
            
            if (event === 'SIGNED_IN' && session) {
                currentUser = session.user;
                showUserMenu(session.user);
            } else if (event === 'SIGNED_OUT') {
                currentUser = null;
                showAuthButtons();
            }
        });
    }
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', (event) => {
        const authDropdown = document.getElementById('auth-dropdown');
        const authDropdownMenu = document.getElementById('auth-dropdown-menu');
        
        if (authDropdown && !authDropdown.contains(event.target)) {
            if (authDropdownVisible) {
                toggleAuthDropdown();
            }
        }
    });
}

// Add authentication functions to global scope
window.toggleAuthDropdown = toggleAuthDropdown;
window.redirectToLogin = redirectToLogin;
window.checkAuthStatus = checkAuthStatus;
window.showUserMenu = showUserMenu;
window.showAuthButtons = showAuthButtons;
window.showProfile = showProfile;
window.showSettings = showSettings;
window.logout = logout;
window.initializeAuth = initializeAuth;
window.updateCurrentTime = updateCurrentTime;

// Initialize authentication when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize authentication
    initializeAuth();
    
    // Initialize basic functionality
    try {
        switchTab('dashboard');
    } catch (e) {
        console.log('switchTab function not available yet');
    }
    
    // Initialize clock
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
    
    console.log('✅ Home page initialized with authentication');
});

// Basic utility functions
function updateCurrentTime() {
    const now = new Date();
    const dateElement = document.getElementById('current-date');
    const timeElement = document.getElementById('current-time');
    
    if (dateElement) {
        dateElement.textContent = now.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    
    if (timeElement) {
        timeElement.textContent = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }
}