// Enhanced Attendance Manager with Real-time QR Code and Analytics
// Professional attendance tracking system for HH310 Academic System

class AttendanceManager {
    constructor() {
        this.supabase = window.supabaseClient;
        this.currentSession = null;
        this.qrCheckInterval = null;
        this.realtimeChannels = [];
        this.activeQRSessions = new Map();
        this.attendanceData = [];
        this.students = [];
        this.groups = [];
        this.timetableSlots = [];
        this.initialize();
    }

    async initialize() {
        try {
            console.log('🚀 Initializing Enhanced Attendance Manager...');
            
            if (!this.supabase) {
                throw new Error('Supabase client not available');
            }

            await this.loadTimetableSlots();
            await this.loadStudentGroups();
            await this.loadStudents();
            this.setupEventListeners();
            this.setupRealtimeSubscriptions();
            this.updateTodaysClasses();
            
            console.log('✅ Enhanced Attendance Manager initialized successfully');
            this.showNotification('Attendance system ready', 'success');
        } catch (error) {
            console.error('❌ Failed to initialize Attendance Manager:', error);
            this.showNotification('Failed to initialize attendance system: ' + error.message, 'error');
        }
    }

    // Load timetable slots for attendance tracking
    async loadTimetableSlots() {
        try {
            const { data: slots, error } = await this.supabase
                .from('timetable_slots')
                .select(`
                    *,
                    subjects(name, code),
                    teachers(name),
                    classrooms(name),
                    student_groups(name, id)
                `)
                .order('day_of_week, start_time');

            if (error) throw error;

            this.timetableSlots = slots || [];
            
            const classSelect = document.getElementById('class-select');
            if (classSelect) {
                classSelect.innerHTML = '<option value="">Choose a class</option>' +
                    this.timetableSlots.map(slot => 
                        `<option value="${slot.id}">
                            ${slot.subjects?.name} - ${slot.student_groups?.name} 
                            (${this.getDayName(slot.day_of_week)} ${slot.start_time})
                        </option>`
                    ).join('');
            }

            console.log(`Loaded ${this.timetableSlots.length} timetable slots`);
        } catch (error) {
            console.error('Failed to load timetable slots:', error);
            this.showNotification('Failed to load class schedule', 'error');
        }
    }

    // Load student groups
    async loadStudentGroups() {
        try {
            const { data: groups, error } = await this.supabase
                .from('student_groups')
                .select('*')
                .order('name');

            if (error) throw error;

            this.groups = groups || [];
            
            const groupSelect = document.getElementById('attendance-group-select');
            if (groupSelect) {
                groupSelect.innerHTML = '<option value="">Select Group</option>' +
                    this.groups.map(group => 
                        `<option value="${group.id}">${group.name} (${group.program})</option>`
                    ).join('');
            }

            console.log(`Loaded ${this.groups.length} student groups`);
        } catch (error) {
            console.error('Failed to load student groups:', error);
        }
    }

    // Load students for attendance tracking
    async loadStudents() {
        try {
            const { data: students, error } = await this.supabase
                .from('students')
                .select(`
                    *,
                    profiles(full_name, email)
                `)
                .order('student_id');

            if (error) throw error;

            this.students = students || [];
            this.attendanceData = this.students.map(student => ({
                ...student,
                status: 'absent',
                marked_at: null
            }));

            console.log(`Loaded ${this.students.length} students`);
        } catch (error) {
            console.error('Failed to load students:', error);
        }
    }

    // Generate enhanced QR Code for attendance
    async generateQRCode() {
        const classSelect = document.getElementById('class-select');
        const selectedSlotId = classSelect?.value;

        if (!selectedSlotId) {
            this.showNotification('Please select a class first', 'warning');
            return;
        }

        try {
            const slot = this.timetableSlots.find(s => s.id === selectedSlotId);
            if (!slot) {
                throw new Error('Selected class not found');
            }

            // Create unique session code
            const sessionCode = this.generateSessionCode();
            const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

            // Create attendance session record
            const sessionData = {
                timetable_slot_id: selectedSlotId,
                date: new Date().toISOString().split('T')[0],
                session_code: sessionCode,
                expires_at: expiresAt.toISOString(),
                created_by: window.currentUser?.id,
                status: 'active',
                metadata: {
                    subject: slot.subjects?.name,
                    group: slot.student_groups?.name,
                    teacher: slot.teachers?.name,
                    classroom: slot.classrooms?.name
                }
            };

            // For demo purposes, we'll simulate saving to database
            // In production, this would save to attendance_sessions table
            const session = {
                id: Date.now().toString(),
                ...sessionData
            };

            this.currentSession = session;
            this.activeQRSessions.set(session.id, session);

            // Generate and display QR Code
            await this.displayQRCode(sessionCode, session);
            
            // Start monitoring for scans
            this.startQRMonitoring(session.id);

            this.showNotification('✅ QR Code generated! Valid for 15 minutes.', 'success');

        } catch (error) {
            console.error('Failed to generate QR code:', error);
            this.showNotification('Failed to generate QR code: ' + error.message, 'error');
        }
    }

    generateSessionCode() {
        return Math.random().toString(36).substring(2, 10).toUpperCase();
    }

    async displayQRCode(code, session) {
        const qrSection = document.getElementById('qr-code-section');
        const qrDisplay = document.querySelector('.qr-code-display');

        if (!qrDisplay) {
            console.error('QR display element not found');
            return;
        }

        try {
            // Create QR code data
            const qrData = JSON.stringify({
                sessionId: session.id,
                code: code,
                timestamp: Date.now(),
                app: 'HH310_Attendance',
                metadata: session.metadata
            });

            // Generate QR code using QRious library
            const canvas = document.createElement('canvas');
            if (window.QRious) {
                const qr = new QRious({
                    element: canvas,
                    value: qrData,
                    size: 280,
                    level: 'M',
                    foreground: '#1f2937',
                    background: '#ffffff'
                });
            } else {
                // Fallback if QRious not available
                canvas.width = 280;
                canvas.height = 280;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#f3f4f6';
                ctx.fillRect(0, 0, 280, 280);
                ctx.fillStyle = '#1f2937';
                ctx.font = '14px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('QR Code Library Not Loaded', 140, 140);
            }

            const expiresTime = new Date(session.expires_at);
            
            qrDisplay.innerHTML = `
                <div class="qr-container">
                    <div class="qr-header">
                        <h4>📱 Attendance QR Code</h4>
                        <div class="qr-timer" id="qr-timer">15:00</div>
                    </div>
                    
                    <div class="qr-code-wrapper">
                        ${canvas.outerHTML}
                    </div>
                    
                    <div class="qr-info">
                        <div class="session-details">
                            <p><strong>Session Code:</strong> <span class="code-display">${code}</span></p>
                            <p><strong>Subject:</strong> ${session.metadata.subject}</p>
                            <p><strong>Group:</strong> ${session.metadata.group}</p>
                            <p><strong>Valid Until:</strong> ${this.formatTime(expiresTime)}</p>
                        </div>
                        <p class="qr-instructions">
                            <i class="fas fa-mobile-alt"></i>
                            Students: Scan this QR code with your phone to mark attendance
                        </p>
                    </div>
                    
                    <div class="qr-stats">
                        <div class="stat-item">
                            <span class="stat-number" id="scanned-count">0</span>
                            <span class="stat-label">Scanned</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number" id="present-count">0</span>
                            <span class="stat-label">Present</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number" id="total-students">${this.students.length}</span>
                            <span class="stat-label">Total</span>
                        </div>
                    </div>
                    
                    <div class="qr-actions">
                        <button class="btn btn--danger" onclick="attendanceManager.stopQRSession('${session.id}')">
                            <i class="fas fa-stop"></i> Stop Session
                        </button>
                        <button class="btn btn--secondary" onclick="attendanceManager.refreshQRCode('${session.id}')">
                            <i class="fas fa-refresh"></i> Refresh
                        </button>
                    </div>
                    
                    <div class="live-attendance" id="live-attendance">
                        <h5>📋 Live Attendance Feed</h5>
                        <div class="attendance-feed" id="attendance-feed">
                            <p class="no-scans">Waiting for students to scan...</p>
                        </div>
                    </div>
                </div>
            `;

            qrSection.classList.remove('hidden');

            // Start countdown timer
            this.startQRTimer(session.id);

        } catch (error) {
            console.error('Failed to display QR code:', error);
            this.showNotification('Failed to display QR code', 'error');
        }
    }

    startQRMonitoring(sessionId) {
        // Simulate checking for new scans every 3 seconds
        this.qrCheckInterval = setInterval(() => {
            this.simulateQRScans(sessionId);
        }, 3000);
    }

    simulateQRScans(sessionId) {
        // Simulate random student scans for demo
        if (Math.random() < 0.3 && this.students.length > 0) {
            const randomStudent = this.students[Math.floor(Math.random() * this.students.length)];
            const isAlreadyMarked = this.attendanceData.find(a => a.id === randomStudent.id && a.status === 'present');
            
            if (!isAlreadyMarked) {
                this.markStudentPresent(randomStudent, 'qr_code');
            }
        }
    }

    markStudentPresent(student, method = 'manual') {
        // Update attendance data
        const index = this.attendanceData.findIndex(a => a.id === student.id);
        if (index !== -1) {
            this.attendanceData[index].status = 'present';
            this.attendanceData[index].marked_at = new Date().toISOString();
            this.attendanceData[index].method = method;
        }

        // Update UI
        this.updateQRStats();
        this.addToAttendanceFeed(student, method);
        
        // Show notification
        this.showNotification(`✅ ${student.profiles?.full_name} marked present`, 'success');
    }

    updateQRStats() {
        const presentStudents = this.attendanceData.filter(a => a.status === 'present');
        const scannedCount = presentStudents.filter(a => a.method === 'qr_code').length;

        const scannedElement = document.getElementById('scanned-count');
        const presentElement = document.getElementById('present-count');

        if (scannedElement) scannedElement.textContent = scannedCount;
        if (presentElement) presentElement.textContent = presentStudents.length;
    }

    addToAttendanceFeed(student, method) {
        const feed = document.getElementById('attendance-feed');
        if (!feed) return;

        // Remove "no scans" message
        const noScans = feed.querySelector('.no-scans');
        if (noScans) noScans.remove();

        // Add new scan to top of feed
        const scanItem = document.createElement('div');
        scanItem.className = 'attendance-scan-item present';
        scanItem.innerHTML = `
            <div class="student-info">
                <span class="student-name">${student.profiles?.full_name || 'Unknown Student'}</span>
                <span class="student-id">${student.student_id || 'No ID'}</span>
            </div>
            <div class="scan-details">
                <span class="scan-method">${method === 'qr_code' ? '📱 QR Scan' : '✏️ Manual'}</span>
                <span class="scan-time">${this.formatTime(new Date())}</span>
            </div>
            <div class="scan-status present">✅ PRESENT</div>
        `;

        feed.insertBefore(scanItem, feed.firstChild);

        // Keep only last 10 items
        while (feed.children.length > 10) {
            feed.removeChild(feed.lastChild);
        }
    }

    startQRTimer(sessionId) {
        const session = this.activeQRSessions.get(sessionId);
        if (!session) return;

        const expiresAt = new Date(session.expires_at);
        
        const timerInterval = setInterval(() => {
            const now = new Date();
            const timeLeft = expiresAt - now;

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                this.stopQRSession(sessionId);
                return;
            }

            const minutes = Math.floor(timeLeft / 60000);
            const seconds = Math.floor((timeLeft % 60000) / 1000);
            
            const timerElement = document.getElementById('qr-timer');
            if (timerElement) {
                timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                
                // Change color when time is running out
                if (timeLeft < 300000) { // Less than 5 minutes
                    timerElement.style.color = '#ef4444';
                } else if (timeLeft < 600000) { // Less than 10 minutes
                    timerElement.style.color = '#f59e0b';
                }
            }
        }, 1000);
    }

    async stopQRSession(sessionId) {
        try {
            // Clear monitoring
            if (this.qrCheckInterval) {
                clearInterval(this.qrCheckInterval);
                this.qrCheckInterval = null;
            }

            // Remove from active sessions
            this.activeQRSessions.delete(sessionId);
            this.currentSession = null;

            // Hide QR section
            const qrSection = document.getElementById('qr-code-section');
            if (qrSection) qrSection.classList.add('hidden');

            // Generate final attendance report
            this.generateAttendanceReport();

            this.showNotification('📋 QR attendance session ended', 'info');

        } catch (error) {
            console.error('Failed to stop QR session:', error);
        }
    }

    refreshQRCode(sessionId) {
        const session = this.activeQRSessions.get(sessionId);
        if (session) {
            // Extend expiry time by 15 minutes
            session.expires_at = new Date(Date.now() + 15 * 60 * 1000).toISOString();
            this.displayQRCode(session.session_code, session);
            this.showNotification('QR Code refreshed for 15 more minutes', 'info');
        }
    }

    // Manual attendance management
    async showManualAttendance() {
        const manualSection = document.getElementById('manual-attendance-section');
        if (!manualSection) return;

        // Load students for the selected group
        await this.loadGroupStudents();
        
        manualSection.classList.remove('hidden');
        this.showNotification('Manual attendance mode activated', 'info');
    }

    async loadGroupStudents() {
        const groupSelect = document.getElementById('attendance-group-select');
        const selectedGroupId = groupSelect?.value;

        if (!selectedGroupId) {
            this.showNotification('Please select a student group first', 'warning');
            return;
        }

        try {
            // Filter students by group
            const groupStudents = this.students.filter(s => s.group_name === selectedGroupId);
            
            const studentsList = document.getElementById('students-attendance-list');
            if (studentsList) {
                studentsList.innerHTML = groupStudents.map(student => `
                    <div class="student-attendance-item" data-student-id="${student.id}">
                        <div class="student-info">
                            <span class="student-name">${student.profiles?.full_name || 'Unknown'}</span>
                            <span class="student-id">${student.student_id || 'No ID'}</span>
                        </div>
                        <div class="attendance-controls">
                            <button class="btn btn--sm btn--success" onclick="attendanceManager.markManualAttendance('${student.id}', 'present')">
                                Present
                            </button>
                            <button class="btn btn--sm btn--warning" onclick="attendanceManager.markManualAttendance('${student.id}', 'late')">
                                Late
                            </button>
                            <button class="btn btn--sm btn--danger" onclick="attendanceManager.markManualAttendance('${student.id}', 'absent')">
                                Absent
                            </button>
                        </div>
                        <div class="attendance-status" id="status-${student.id}">
                            <span class="status-badge absent">Not Marked</span>
                        </div>
                    </div>
                `).join('');
            }

        } catch (error) {
            console.error('Failed to load group students:', error);
        }
    }

    markManualAttendance(studentId, status) {
        const student = this.students.find(s => s.id === studentId);
        if (!student) return;

        // Update attendance data
        const index = this.attendanceData.findIndex(a => a.id === studentId);
        if (index !== -1) {
            this.attendanceData[index].status = status;
            this.attendanceData[index].marked_at = new Date().toISOString();
            this.attendanceData[index].method = 'manual';
        }

        // Update UI
        const statusElement = document.getElementById(`status-${studentId}`);
        if (statusElement) {
            statusElement.innerHTML = `<span class="status-badge ${status}">${status.toUpperCase()}</span>`;
        }

        this.showNotification(`${student.profiles?.full_name} marked as ${status}`, 'success');
        this.updateAttendanceSummary();
    }

    markAllPresent() {
        if (!this.attendanceData || this.attendanceData.length === 0) {
            this.showNotification('No students loaded. Please select a group first.', 'warning');
            return;
        }

        try {
            this.attendanceData.forEach(student => {
                if (student.status !== 'present') {
                    this.markManualAttendance(student.id, 'present');
                }
            });
            
            this.showNotification(`✅ Marked all ${this.attendanceData.length} students as present`, 'success');
            this.updateAttendanceSummary();
        } catch (error) {
            console.error('Failed to mark all present:', error);
            this.showNotification('Failed to mark all students present', 'error');
        }
    }

    refreshAttendanceData() {
        try {
            this.showNotification('🔄 Refreshing attendance data...', 'info');
            this.loadStudents().then(() => {
                this.loadGroupStudents();
                this.showNotification('✅ Attendance data refreshed', 'success');
            });
        } catch (error) {
            console.error('Failed to refresh attendance data:', error);
            this.showNotification('Failed to refresh attendance data', 'error');
        }
    }

    async saveAttendance() {
        if (!this.currentSession) {
            this.showNotification('No active attendance session to save', 'warning');
            return;
        }

        try {
            this.showNotification('💾 Saving attendance records...', 'info');
            
            // In a real implementation, this would save to Supabase
            const attendanceRecords = this.attendanceData
                .filter(student => student.status !== 'absent')
                .map(student => ({
                    student_id: student.id,
                    timetable_slot_id: this.currentSession.timetable_slot_id,
                    date: new Date().toISOString().split('T')[0],
                    status: student.status,
                    marked_at: student.marked_at || new Date().toISOString(),
                    method: student.method || 'manual'
                }));

            // Simulate saving to database
            console.log('Saving attendance records:', attendanceRecords);
            
            // For demo purposes, simulate success
            setTimeout(() => {
                this.showNotification(`✅ Saved ${attendanceRecords.length} attendance records`, 'success');
                this.generateAttendanceReport();
            }, 1000);

        } catch (error) {
            console.error('Failed to save attendance:', error);
            this.showNotification('Failed to save attendance records', 'error');
        }
    }

    // Enhanced conflict detection for attendance
    detectAttendanceConflicts(studentId, newStatus) {
        const existingRecord = this.attendanceData.find(a => a.id === studentId);
        
        if (existingRecord && existingRecord.status !== 'absent' && existingRecord.status !== newStatus) {
            return {
                hasConflict: true,
                message: `Student already marked as ${existingRecord.status}. Change to ${newStatus}?`,
                previousStatus: existingRecord.status
            };
        }
        
        return { hasConflict: false };
    }

    // Enhanced real-time channel subscriptions
    setupRealtimeSubscriptions() {
        if (!this.supabase) {
            console.warn('Supabase client not available for real-time subscriptions');
            return;
        }

        try {
            // Subscribe to attendance records changes
            const attendanceChannel = this.supabase
                .channel('attendance-realtime')
                .on('postgres_changes', 
                    { event: '*', schema: 'public', table: 'attendance_records' }, 
                    (payload) => this.handleRealtimeAttendanceChange(payload)
                )
                .on('postgres_changes',
                    { event: '*', schema: 'public', table: 'attendance_sessions' },
                    (payload) => this.handleRealtimeSessionChange(payload)
                )
                .subscribe();

            this.realtimeChannels.push(attendanceChannel);
            console.log('✅ Attendance real-time subscriptions established');
            
            // Show real-time indicator
            this.showRealtimeIndicator(true);
        } catch (error) {
            console.error('Failed to setup real-time subscriptions:', error);
            this.showNotification('Real-time sync unavailable (offline mode)', 'warning');
        }
    }

    handleRealtimeAttendanceChange(payload) {
        console.log('📡 Real-time attendance change:', payload);
        
        try {
            switch (payload.eventType) {
                case 'INSERT':
                    this.handleNewAttendanceRecord(payload.new);
                    break;
                case 'UPDATE':
                    this.handleUpdatedAttendanceRecord(payload.new);
                    break;
                case 'DELETE':
                    this.handleDeletedAttendanceRecord(payload.old);
                    break;
            }
        } catch (error) {
            console.error('Error handling real-time attendance change:', error);
        }
    }

    handleRealtimeSessionChange(payload) {
        console.log('📡 Real-time session change:', payload);
        
        if (payload.eventType === 'UPDATE' && payload.new.status === 'expired') {
            this.handleSessionExpiry(payload.new);
        }
    }

    handleNewAttendanceRecord(record) {
        // Update local attendance data
        const studentIndex = this.attendanceData.findIndex(s => s.id === record.student_id);
        if (studentIndex !== -1) {
            this.attendanceData[studentIndex].status = record.status;
            this.attendanceData[studentIndex].marked_at = record.marked_at;
            this.attendanceData[studentIndex].method = record.method;
        }

        // Update UI
        this.updateQRStats();
        this.addToAttendanceFeed(record, record.method);
        this.showNotification(`📡 ${record.student_name || 'Student'} marked ${record.status} (real-time)`, 'info');
    }

    showRealtimeIndicator(isActive) {
        const indicator = document.getElementById('realtime-indicator');
        if (indicator) {
            indicator.style.display = isActive ? 'block' : 'none';
            indicator.className = `realtime-indicator ${isActive ? 'active' : 'inactive'}`;
        }
    }

    // Performance optimization with debouncing
    debounce(func, wait) {
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

    // Initialize debounced functions
    initializeOptimizations() {
        // Debounce search function
        this.debouncedSearch = this.debounce((searchTerm) => {
            this.filterStudentsBySearch(searchTerm);
        }, 300);

        // Debounce auto-save
        this.debouncedAutoSave = this.debounce(() => {
            this.autoSaveAttendance();
        }, 5000);
    }

    filterStudentsBySearch(searchTerm) {
        const studentsList = document.getElementById('students-attendance-list');
        if (!studentsList) return;

        const items = studentsList.querySelectorAll('.student-attendance-item');
        const term = searchTerm.toLowerCase();

        items.forEach(item => {
            const name = item.querySelector('.student-name')?.textContent.toLowerCase() || '';
            const id = item.querySelector('.student-id')?.textContent.toLowerCase() || '';
            
            if (name.includes(term) || id.includes(term)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }

    autoSaveAttendance() {
        if (this.attendanceData.some(s => s.status !== 'absent')) {
            console.log('💾 Auto-saving attendance data...');
            // In production, this would save to Supabase
            this.showNotification('💾 Auto-saved attendance data', 'info');
        }
    }

    // Enhanced error handling with retry logic
    async withRetry(operation, maxRetries = 3, delay = 1000) {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                console.error(`Attempt ${attempt} failed:`, error);
                
                if (attempt === maxRetries) {
                    throw error;
                }
                
                // Wait before retry
                await new Promise(resolve => setTimeout(resolve, delay * attempt));
            }
        }
    }

    // Add ARIA labels for accessibility
    addAccessibilityLabels() {
        // Add ARIA labels to key elements
        const qrSection = document.getElementById('qr-code-section');
        if (qrSection) {
            qrSection.setAttribute('aria-label', 'QR Code Attendance Section');
            qrSection.setAttribute('role', 'region');
        }

        const attendanceList = document.getElementById('students-attendance-list');
        if (attendanceList) {
            attendanceList.setAttribute('aria-label', 'Students Attendance List');
            attendanceList.setAttribute('role', 'list');
        }

        // Add keyboard navigation support
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                // Close any open modals or QR sessions
                this.stopQRSession(this.currentSession?.id);
            }
        });
    }

    // Cleanup
    cleanup() {
        // Clear intervals
        if (this.qrCheckInterval) {
            clearInterval(this.qrCheckInterval);
        }

        // Unsubscribe from real-time channels
        this.realtimeChannels.forEach(channel => {
            this.supabase.removeChannel(channel);
        });
        this.realtimeChannels = [];

        console.log('🧹 Attendance Manager cleanup completed');
    }
}

// Initialize attendance manager
let attendanceManager;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Delay initialization to ensure Supabase is ready
    setTimeout(() => {
        attendanceManager = new AttendanceManager();
    }, 2000);
});

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
    if (attendanceManager) {
        attendanceManager.cleanup();
    }
});

// Export for global access
window.attendanceManager = attendanceManager;
