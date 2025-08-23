// Realtime Manager for Live Updates
// Professional realtime synchronization using Supabase Realtime

class RealtimeManager {
    constructor() {
        this.supabase = window.supabaseClient;
        this.channels = new Map();
        this.subscribers = new Map();
        this.connectionStatus = 'disconnected';
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.heartbeatInterval = null;
        
        this.initialize();
    }

    async initialize() {
        try {
            console.log('🔄 Initializing Realtime Manager...');
            
            if (!this.supabase) {
                throw new Error('Supabase client not available');
            }

            await this.setupRealtimeConnection();
            this.setupConnectionMonitoring();
            this.startHeartbeat();
            
            console.log('✅ Realtime Manager initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize Realtime Manager:', error);
            this.scheduleReconnect();
        }
    }

    async setupRealtimeConnection() {
        // Subscribe to attendance updates
        this.subscribeToAttendance();
        
        // Subscribe to timetable updates
        this.subscribeToTimetable();
        
        // Subscribe to user presence
        this.subscribeToUserPresence();
        
        // Subscribe to system notifications
        this.subscribeToNotifications();
        
        this.connectionStatus = 'connected';
        this.updateConnectionIndicator();
        this.showNotification('Connected to live updates', 'success');
    }

    subscribeToAttendance() {
        const attendanceChannel = this.supabase
            .channel('attendance_updates')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'attendance_records'
            }, (payload) => {
                this.handleAttendanceUpdate(payload);
            })
            .subscribe((status) => {
                console.log('Attendance subscription status:', status);
            });

        this.channels.set('attendance', attendanceChannel);
    }

    subscribeToTimetable() {
        const timetableChannel = this.supabase
            .channel('timetable_updates')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'timetable_slots'
            }, (payload) => {
                this.handleTimetableUpdate(payload);
            })
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'timetables'
            }, (payload) => {
                this.handleTimetableMetaUpdate(payload);
            })
            .subscribe((status) => {
                console.log('Timetable subscription status:', status);
            });

        this.channels.set('timetable', timetableChannel);
    }

    subscribeToUserPresence() {
        const presenceChannel = this.supabase
            .channel('user_presence')
            .on('presence', { event: 'sync' }, () => {
                const state = presenceChannel.presenceState();
                this.handlePresenceSync(state);
            })
            .on('presence', { event: 'join' }, ({ key, newPresences }) => {
                this.handleUserJoin(key, newPresences);
            })
            .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
                this.handleUserLeave(key, leftPresences);
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    const user = await this.supabase.auth.getUser();
                    if (user.data.user) {
                        await presenceChannel.track({
                            user_id: user.data.user.id,
                            online_at: new Date().toISOString(),
                            status: 'online'
                        });
                    }
                }
            });

        this.channels.set('presence', presenceChannel);
    }

    subscribeToNotifications() {
        const notificationsChannel = this.supabase
            .channel('system_notifications')
            .on('broadcast', { event: 'notification' }, (payload) => {
                this.handleSystemNotification(payload);
            })
            .subscribe((status) => {
                console.log('Notifications subscription status:', status);
            });

        this.channels.set('notifications', notificationsChannel);
    }

    // Event Handlers
    handleAttendanceUpdate(payload) {
        console.log('📊 Attendance update received:', payload);
        
        const { eventType, new: newRecord, old: oldRecord } = payload;
        
        switch (eventType) {
            case 'INSERT':
                this.onAttendanceMarked(newRecord);
                break;
            case 'UPDATE':
                this.onAttendanceUpdated(newRecord, oldRecord);
                break;
            case 'DELETE':
                this.onAttendanceDeleted(oldRecord);
                break;
        }
        
        // Notify subscribers
        this.notifySubscribers('attendance', payload);
        
        // Update UI if attendance module is active
        if (window.attendanceManager && document.getElementById('attendance-module').classList.contains('active')) {
            window.attendanceManager.refreshRealtimeData();
        }
        
        // Update analytics charts
        if (window.analyticsManager) {
            window.analyticsManager.refreshChartData('attendanceRate');
            window.analyticsManager.refreshChartData('dailyTrends');
        }
    }

    handleTimetableUpdate(payload) {
        console.log('📅 Timetable update received:', payload);
        
        const { eventType, new: newSlot, old: oldSlot } = payload;
        
        switch (eventType) {
            case 'INSERT':
                this.onTimetableSlotAdded(newSlot);
                break;
            case 'UPDATE':
                this.onTimetableSlotUpdated(newSlot, oldSlot);
                break;
            case 'DELETE':
                this.onTimetableSlotDeleted(oldSlot);
                break;
        }
        
        // Notify subscribers
        this.notifySubscribers('timetable', payload);
        
        // Update timetable display if active
        if (window.timetableManager && document.getElementById('timetable-module').classList.contains('active')) {
            window.timetableManager.refreshTimetableDisplay();
        }
    }

    handleTimetableMetaUpdate(payload) {
        console.log('📋 Timetable metadata update received:', payload);
        
        // Handle timetable generation status updates
        if (payload.new && payload.new.status) {
            this.updateTimetableGenerationStatus(payload.new);
        }
        
        this.notifySubscribers('timetable_meta', payload);
    }

    handlePresenceSync(state) {
        console.log('👥 Presence sync:', state);
        this.updateOnlineUsers(state);
    }

    handleUserJoin(key, newPresences) {
        console.log('👋 User joined:', key, newPresences);
        this.showUserJoinNotification(newPresences[0]);
    }

    handleUserLeave(key, leftPresences) {
        console.log('👋 User left:', key, leftPresences);
        this.showUserLeaveNotification(leftPresences[0]);
    }

    handleSystemNotification(payload) {
        console.log('🔔 System notification:', payload);
        this.showNotification(payload.message, payload.type || 'info');
    }

    // Specific Event Handlers
    onAttendanceMarked(record) {
        // Update QR scan counter if QR section is active
        const qrSection = document.getElementById('qr-code-section');
        if (qrSection && !qrSection.classList.contains('hidden')) {
            const counter = document.getElementById('qr-scanned');
            if (counter) {
                const current = parseInt(counter.textContent) || 0;
                counter.textContent = current + 1;
                
                // Flash animation
                counter.style.animation = 'flash 0.5s ease-out';
                setTimeout(() => counter.style.animation = '', 500);
            }
        }
        
        // Update attendance summary
        this.updateAttendanceSummary();
        
        // Show notification
        this.showNotification(`Attendance marked for student`, 'success');
    }

    onAttendanceUpdated(newRecord, oldRecord) {
        this.updateAttendanceSummary();
        this.showNotification(`Attendance updated from ${oldRecord.status} to ${newRecord.status}`, 'info');
    }

    onAttendanceDeleted(record) {
        this.updateAttendanceSummary();
        this.showNotification('Attendance record deleted', 'warning');
    }

    onTimetableSlotAdded(slot) {
        this.showNotification('New class added to timetable', 'success');
    }

    onTimetableSlotUpdated(newSlot, oldSlot) {
        this.showNotification('Timetable updated', 'info');
    }

    onTimetableSlotDeleted(slot) {
        this.showNotification('Class removed from timetable', 'warning');
    }

    // Connection Management
    setupConnectionMonitoring() {
        // Monitor connection status
        this.supabase.realtime.onOpen(() => {
            this.connectionStatus = 'connected';
            this.reconnectAttempts = 0;
            this.updateConnectionIndicator();
            console.log('🟢 Realtime connection opened');
        });

        this.supabase.realtime.onClose(() => {
            this.connectionStatus = 'disconnected';
            this.updateConnectionIndicator();
            console.log('🔴 Realtime connection closed');
            this.scheduleReconnect();
        });

        this.supabase.realtime.onError((error) => {
            console.error('❌ Realtime connection error:', error);
            this.connectionStatus = 'error';
            this.updateConnectionIndicator();
        });
    }

    startHeartbeat() {
        this.heartbeatInterval = setInterval(() => {
            if (this.connectionStatus === 'connected') {
                // Send heartbeat to all channels
                this.channels.forEach((channel, name) => {
                    channel.send({
                        type: 'broadcast',
                        event: 'heartbeat',
                        payload: { timestamp: new Date().toISOString() }
                    });
                });
            }
        }, 30000); // Every 30 seconds
    }

    scheduleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
            
            console.log(`⏳ Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);
            
            setTimeout(() => {
                this.reconnect();
            }, delay);
        } else {
            console.error('❌ Max reconnection attempts reached');
            this.showNotification('Connection lost. Please refresh the page.', 'error');
        }
    }

    async reconnect() {
        try {
            console.log('🔄 Attempting to reconnect...');
            
            // Close existing channels
            this.unsubscribeAll();
            
            // Reinitialize connection
            await this.setupRealtimeConnection();
            
            console.log('✅ Reconnected successfully');
        } catch (error) {
            console.error('❌ Reconnection failed:', error);
            this.scheduleReconnect();
        }
    }

    // UI Updates
    updateConnectionIndicator() {
        const indicator = document.getElementById('realtime-indicator');
        if (!indicator) return;

        indicator.style.display = this.connectionStatus === 'connected' ? 'block' : 'none';
        
        const statusClass = {
            'connected': 'status--success',
            'disconnected': 'status--danger',
            'error': 'status--warning'
        }[this.connectionStatus];
        
        indicator.className = `realtime-indicator ${statusClass}`;
        
        // Add pulsing animation for connected state
        if (this.connectionStatus === 'connected') {
            indicator.style.animation = 'pulse 2s infinite';
        } else {
            indicator.style.animation = 'none';
        }
    }

    updateAttendanceSummary() {
        // This would typically fetch fresh data and update the UI
        if (window.attendanceManager) {
            window.attendanceManager.updateAttendanceSummary();
        }
    }

    updateOnlineUsers(state) {
        const onlineCount = Object.keys(state).length;
        const onlineIndicator = document.querySelector('.online-users-count');
        if (onlineIndicator) {
            onlineIndicator.textContent = onlineCount;
        }
    }

    updateTimetableGenerationStatus(timetableData) {
        const statusElement = document.querySelector('.generation-status');
        if (statusElement) {
            statusElement.textContent = timetableData.status;
            statusElement.className = `generation-status status--${timetableData.status}`;
        }
        
        if (timetableData.status === 'completed') {
            this.showNotification('Timetable generation completed!', 'success');
            
            // Hide progress indicator
            const progressElement = document.getElementById('generation-progress');
            if (progressElement) {
                progressElement.classList.add('hidden');
            }
        }
    }

    // Notification Methods
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Add to container
        const container = document.getElementById('notification-container') || 
                         this.createNotificationContainer();
        container.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
        
        // Animate in
        setTimeout(() => notification.classList.add('notification--show'), 100);
    }

    showUserJoinNotification(presence) {
        this.showNotification(`${presence.user_id} joined`, 'info');
    }

    showUserLeaveNotification(presence) {
        this.showNotification(`${presence.user_id} left`, 'info');
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    createNotificationContainer() {
        const container = document.createElement('div');
        container.id = 'notification-container';
        container.className = 'notification-container';
        document.body.appendChild(container);
        return container;
    }

    // Subscription Management
    subscribe(event, callback) {
        if (!this.subscribers.has(event)) {
            this.subscribers.set(event, new Set());
        }
        this.subscribers.get(event).add(callback);
        
        return () => {
            this.subscribers.get(event)?.delete(callback);
        };
    }

    notifySubscribers(event, data) {
        const callbacks = this.subscribers.get(event);
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error('Error in subscriber callback:', error);
                }
            });
        }
    }

    // Public Methods
    sendBroadcast(channel, event, payload) {
        const channelInstance = this.channels.get(channel);
        if (channelInstance) {
            channelInstance.send({
                type: 'broadcast',
                event: event,
                payload: payload
            });
        }
    }

    unsubscribeAll() {
        this.channels.forEach((channel, name) => {
            channel.unsubscribe();
        });
        this.channels.clear();
    }

    // Cleanup
    destroy() {
        // Clear heartbeat
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }
        
        // Unsubscribe from all channels
        this.unsubscribeAll();
        
        // Clear subscribers
        this.subscribers.clear();
        
        console.log('🧹 Realtime Manager destroyed');
    }
}

// CSS for notifications (add to existing styles)
const notificationStyles = `
    .notification-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        max-width: 400px;
    }
    
    .notification {
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        margin-bottom: 10px;
        padding: 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        border-left: 4px solid;
    }
    
    .notification--show {
        transform: translateX(0);
    }
    
    .notification--success {
        border-left-color: #10b981;
        color: #065f46;
    }
    
    .notification--error {
        border-left-color: #ef4444;
        color: #991b1b;
    }
    
    .notification--warning {
        border-left-color: #f59e0b;
        color: #92400e;
    }
    
    .notification--info {
        border-left-color: #3b82f6;
        color: #1e40af;
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .notification-close {
        background: none;
        border: none;
        cursor: pointer;
        opacity: 0.5;
        transition: opacity 0.2s;
    }
    
    .notification-close:hover {
        opacity: 1;
    }
    
    .realtime-indicator {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 14px;
        font-weight: 500;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        z-index: 1000;
    }
    
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
    }
    
    @keyframes flash {
        0%, 100% { background-color: transparent; }
        50% { background-color: #10b981; color: white; }
    }
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);

// Initialize Realtime Manager
window.realtimeManager = new RealtimeManager();

// Export for use in other modules
window.RealtimeManager = RealtimeManager;

console.log('✅ Realtime Manager loaded successfully');
