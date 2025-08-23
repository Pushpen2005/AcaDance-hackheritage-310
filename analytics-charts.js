// Advanced Charts and Analytics Module
// Professional data visualization and analytics for HH310 Academic System

class AnalyticsManager {
    constructor() {
        this.charts = {};
        this.chartColors = {
            primary: '#667eea',
            secondary: '#764ba2',
            success: '#10b981',
            warning: '#f59e0b',
            danger: '#ef4444',
            info: '#3b82f6'
        };
        this.chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            }
        };
        this.loadChartJS();
    }

    async loadChartJS() {
        if (typeof Chart === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.min.js';
            script.onload = () => {
                console.log('✅ Chart.js loaded successfully');
                this.initializeCharts();
            };
            document.head.appendChild(script);
        } else {
            this.initializeCharts();
        }
    }

    initializeCharts() {
        // Initialize all analytics charts
        this.initializeAttendanceCharts();
        this.initializeTimetableCharts();
        this.initializeReportsCharts();
        this.initializeDashboardCharts();
    }

    // Dashboard Analytics
    initializeDashboardCharts() {
        this.createAttendanceTrendChart();
        this.createSubjectDistributionChart();
        this.createWeeklyOverviewChart();
    }

    createAttendanceTrendChart() {
        const ctx = document.getElementById('attendance-trend-chart');
        if (!ctx) return;

        const data = this.generateAttendanceTrendData();
        
        this.charts.attendanceTrend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Attendance Rate',
                    data: data.values,
                    borderColor: this.chartColors.primary,
                    backgroundColor: this.chartColors.primary + '20',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                ...this.chartOptions,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Weekly Attendance Trends'
                    }
                }
            }
        });
    }

    createSubjectDistributionChart() {
        const ctx = document.getElementById('subject-distribution-chart');
        if (!ctx) return;

        const data = this.generateSubjectDistributionData();
        
        this.charts.subjectDistribution = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.labels,
                datasets: [{
                    data: data.values,
                    backgroundColor: [
                        this.chartColors.primary,
                        this.chartColors.secondary,
                        this.chartColors.success,
                        this.chartColors.warning,
                        this.chartColors.info
                    ]
                }]
            },
            options: {
                ...this.chartOptions,
                plugins: {
                    title: {
                        display: true,
                        text: 'Subject Hours Distribution'
                    },
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    createWeeklyOverviewChart() {
        const ctx = document.getElementById('weekly-overview-chart');
        if (!ctx) return;

        const data = this.generateWeeklyOverviewData();
        
        this.charts.weeklyOverview = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
                datasets: [{
                    label: 'Classes',
                    data: data.classes,
                    backgroundColor: this.chartColors.primary,
                }, {
                    label: 'Attendance Rate',
                    data: data.attendance,
                    backgroundColor: this.chartColors.success,
                    type: 'line',
                    yAxisID: 'y1'
                }]
            },
            options: {
                ...this.chartOptions,
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        beginAtZero: true
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            drawOnChartArea: false,
                        },
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Weekly Classes & Attendance Overview'
                    }
                }
            }
        });
    }

    // Attendance Analytics
    initializeAttendanceCharts() {
        this.createAttendanceRateChart();
        this.createDailyTrendsChart();
        this.createSubjectAttendanceChart();
        this.createStudentPerformanceChart();
    }

    createAttendanceRateChart() {
        const ctx = document.getElementById('attendance-rate-chart');
        if (!ctx) return;

        const data = this.generateAttendanceRateData();
        
        this.charts.attendanceRate = new Chart(ctx, {
            type: 'gauge', // Custom gauge chart
            data: {
                datasets: [{
                    data: [data.rate, 100 - data.rate],
                    backgroundColor: [
                        data.rate >= 75 ? this.chartColors.success : 
                        data.rate >= 60 ? this.chartColors.warning : this.chartColors.danger,
                        '#e5e7eb'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                circumference: 180,
                rotation: 270,
                cutout: '70%',
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: `Overall Attendance: ${data.rate}%`
                    }
                }
            }
        });
    }

    createDailyTrendsChart() {
        const ctx = document.getElementById('daily-trends-chart');
        if (!ctx) return;

        const data = this.generateDailyTrendsData();
        
        this.charts.dailyTrends = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Present',
                    data: data.present,
                    borderColor: this.chartColors.success,
                    backgroundColor: this.chartColors.success + '20',
                    tension: 0.4
                }, {
                    label: 'Absent',
                    data: data.absent,
                    borderColor: this.chartColors.danger,
                    backgroundColor: this.chartColors.danger + '20',
                    tension: 0.4
                }, {
                    label: 'Late',
                    data: data.late,
                    borderColor: this.chartColors.warning,
                    backgroundColor: this.chartColors.warning + '20',
                    tension: 0.4
                }]
            },
            options: {
                ...this.chartOptions,
                plugins: {
                    title: {
                        display: true,
                        text: 'Daily Attendance Trends'
                    }
                }
            }
        });
    }

    createSubjectAttendanceChart() {
        const ctx = document.getElementById('subject-attendance-chart');
        if (!ctx) return;

        const data = this.generateSubjectAttendanceData();
        
        this.charts.subjectAttendance = new Chart(ctx, {
            type: 'horizontalBar',
            data: {
                labels: data.subjects,
                datasets: [{
                    label: 'Attendance Rate',
                    data: data.rates,
                    backgroundColor: data.rates.map(rate => 
                        rate >= 75 ? this.chartColors.success : 
                        rate >= 60 ? this.chartColors.warning : this.chartColors.danger
                    )
                }]
            },
            options: {
                ...this.chartOptions,
                indexAxis: 'y',
                scales: {
                    x: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Subject-wise Attendance Rates'
                    }
                }
            }
        });
    }

    createStudentPerformanceChart() {
        const ctx = document.getElementById('student-performance-chart');
        if (!ctx) return;

        const data = this.generateStudentPerformanceData();
        
        this.charts.studentPerformance = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Students',
                    data: data.points,
                    backgroundColor: this.chartColors.primary,
                    borderColor: this.chartColors.primary,
                }]
            },
            options: {
                ...this.chartOptions,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Classes Attended'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Attendance Percentage'
                        },
                        max: 100
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Student Performance Distribution'
                    }
                }
            }
        });
    }

    // Timetable Analytics
    initializeTimetableCharts() {
        this.createTeacherWorkloadChart();
        this.createRoomUtilizationChart();
        this.createTimeSlotDistributionChart();
    }

    createTeacherWorkloadChart() {
        const ctx = document.getElementById('teacher-workload-chart');
        if (!ctx) return;

        const data = this.generateTeacherWorkloadData();
        
        this.charts.teacherWorkload = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.teachers,
                datasets: [{
                    label: 'Assigned Hours',
                    data: data.assignedHours,
                    backgroundColor: this.chartColors.primary
                }, {
                    label: 'Max Hours',
                    data: data.maxHours,
                    backgroundColor: this.chartColors.secondary,
                    type: 'line'
                }]
            },
            options: {
                ...this.chartOptions,
                plugins: {
                    title: {
                        display: true,
                        text: 'Teacher Workload Distribution'
                    }
                }
            }
        });
    }

    createRoomUtilizationChart() {
        const ctx = document.getElementById('room-utilization-chart');
        if (!ctx) return;

        const data = this.generateRoomUtilizationData();
        
        this.charts.roomUtilization = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: data.timeSlots,
                datasets: data.rooms.map((room, index) => ({
                    label: room.name,
                    data: room.utilization,
                    borderColor: Object.values(this.chartColors)[index % Object.keys(this.chartColors).length],
                    backgroundColor: Object.values(this.chartColors)[index % Object.keys(this.chartColors).length] + '20'
                }))
            },
            options: {
                ...this.chartOptions,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Room Utilization by Time Slot'
                    }
                }
            }
        });
    }

    createTimeSlotDistributionChart() {
        const ctx = document.getElementById('timeslot-distribution-chart');
        if (!ctx) return;

        const data = this.generateTimeSlotDistributionData();
        
        this.charts.timeSlotDistribution = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.timeSlots,
                datasets: [{
                    label: 'Classes Scheduled',
                    data: data.counts,
                    backgroundColor: this.chartColors.info
                }]
            },
            options: {
                ...this.chartOptions,
                plugins: {
                    title: {
                        display: true,
                        text: 'Classes Distribution by Time Slot'
                    }
                }
            }
        });
    }

    // Reports Analytics
    initializeReportsCharts() {
        this.createSystemOverviewChart();
        this.createTrendAnalysisChart();
        this.createPerformanceMetricsChart();
    }

    createSystemOverviewChart() {
        const ctx = document.getElementById('system-overview-chart');
        if (!ctx) return;

        const data = this.generateSystemOverviewData();
        
        this.charts.systemOverview = new Chart(ctx, {
            type: 'polarArea',
            data: {
                labels: data.labels,
                datasets: [{
                    data: data.values,
                    backgroundColor: Object.values(this.chartColors)
                }]
            },
            options: {
                ...this.chartOptions,
                plugins: {
                    title: {
                        display: true,
                        text: 'System Overview Metrics'
                    }
                }
            }
        });
    }

    createTrendAnalysisChart() {
        const ctx = document.getElementById('trend-analysis-chart');
        if (!ctx) return;

        const data = this.generateTrendAnalysisData();
        
        this.charts.trendAnalysis = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.months,
                datasets: [{
                    label: 'Average Attendance',
                    data: data.attendance,
                    borderColor: this.chartColors.primary,
                    tension: 0.4
                }, {
                    label: 'Classes Conducted',
                    data: data.classes,
                    borderColor: this.chartColors.secondary,
                    tension: 0.4,
                    yAxisID: 'y1'
                }]
            },
            options: {
                ...this.chartOptions,
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        grid: {
                            drawOnChartArea: false,
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Monthly Trends Analysis'
                    }
                }
            }
        });
    }

    createPerformanceMetricsChart() {
        const ctx = document.getElementById('performance-metrics-chart');
        if (!ctx) return;

        const data = this.generatePerformanceMetricsData();
        
        this.charts.performanceMetrics = new Chart(ctx, {
            type: 'bubble',
            data: {
                datasets: data.departments.map((dept, index) => ({
                    label: dept.name,
                    data: dept.metrics,
                    backgroundColor: Object.values(this.chartColors)[index % Object.keys(this.chartColors).length]
                }))
            },
            options: {
                ...this.chartOptions,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Average Attendance (%)'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Class Completion Rate (%)'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Department Performance Metrics'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: (${context.raw.x}%, ${context.raw.y}%) Size: ${context.raw.r}`;
                            }
                        }
                    }
                }
            }
        });
    }

    // Data Generation Methods (Replace with real data from Supabase)
    generateAttendanceTrendData() {
        return {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
            values: [85, 87, 82, 89, 86, 88]
        };
    }

    generateSubjectDistributionData() {
        return {
            labels: ['Mathematics', 'Physics', 'Chemistry', 'Computer Science', 'English'],
            values: [25, 20, 18, 22, 15]
        };
    }

    generateWeeklyOverviewData() {
        return {
            classes: [8, 7, 9, 8, 6],
            attendance: [85, 87, 82, 89, 86]
        };
    }

    generateAttendanceRateData() {
        return {
            rate: 86
        };
    }

    generateDailyTrendsData() {
        return {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            present: [25, 27, 24, 26, 23, 15, 10],
            absent: [5, 3, 6, 4, 7, 5, 2],
            late: [2, 1, 3, 2, 2, 1, 0]
        };
    }

    generateSubjectAttendanceData() {
        return {
            subjects: ['Mathematics', 'Physics', 'Chemistry', 'CS', 'English'],
            rates: [88, 85, 82, 91, 87]
        };
    }

    generateStudentPerformanceData() {
        return {
            points: [
                {x: 25, y: 85}, {x: 28, y: 92}, {x: 22, y: 78},
                {x: 30, y: 95}, {x: 20, y: 72}, {x: 27, y: 89},
                {x: 24, y: 81}, {x: 29, y: 93}, {x: 21, y: 75}
            ]
        };
    }

    generateTeacherWorkloadData() {
        return {
            teachers: ['Dr. Smith', 'Prof. Johnson', 'Dr. Davis', 'Ms. Wilson', 'Dr. Taylor'],
            assignedHours: [18, 16, 20, 14, 22],
            maxHours: [20, 18, 22, 16, 24]
        };
    }

    generateRoomUtilizationData() {
        return {
            timeSlots: ['9-10', '10-11', '11-12', '2-3', '3-4', '4-5'],
            rooms: [
                {
                    name: 'Room A101',
                    utilization: [80, 60, 90, 70, 85, 65]
                },
                {
                    name: 'Room B205',
                    utilization: [70, 85, 75, 80, 60, 90]
                },
                {
                    name: 'Lab C103',
                    utilization: [60, 70, 80, 90, 75, 85]
                }
            ]
        };
    }

    generateTimeSlotDistributionData() {
        return {
            timeSlots: ['9-10 AM', '10-11 AM', '11-12 PM', '2-3 PM', '3-4 PM', '4-5 PM'],
            counts: [12, 15, 18, 14, 16, 10]
        };
    }

    generateSystemOverviewData() {
        return {
            labels: ['Total Students', 'Active Teachers', 'Classrooms', 'Subjects', 'Weekly Classes'],
            values: [150, 12, 8, 15, 85]
        };
    }

    generateTrendAnalysisData() {
        return {
            months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            attendance: [82, 85, 88, 86, 89, 87],
            classes: [320, 340, 360, 350, 370, 365]
        };
    }

    generatePerformanceMetricsData() {
        return {
            departments: [
                {
                    name: 'Engineering',
                    metrics: [{x: 85, y: 92, r: 10}]
                },
                {
                    name: 'Science',
                    metrics: [{x: 88, y: 89, r: 8}]
                },
                {
                    name: 'Arts',
                    metrics: [{x: 82, y: 95, r: 6}]
                }
            ]
        };
    }

    // Update methods for real-time data
    updateChart(chartName, newData) {
        if (this.charts[chartName]) {
            this.charts[chartName].data = newData;
            this.charts[chartName].update();
        }
    }

    updateAllCharts() {
        Object.keys(this.charts).forEach(chartName => {
            this.refreshChartData(chartName);
        });
    }

    refreshChartData(chartName) {
        // In a real application, fetch fresh data from Supabase
        console.log(`Refreshing data for chart: ${chartName}`);
        
        switch (chartName) {
            case 'attendanceTrend':
                this.updateChart(chartName, {
                    labels: this.generateAttendanceTrendData().labels,
                    datasets: [{
                        label: 'Attendance Rate',
                        data: this.generateAttendanceTrendData().values,
                        borderColor: this.chartColors.primary,
                        backgroundColor: this.chartColors.primary + '20',
                        tension: 0.4,
                        fill: true
                    }]
                });
                break;
            // Add cases for other charts as needed
        }
    }

    // Export chart as image
    exportChart(chartName, filename) {
        if (this.charts[chartName]) {
            const url = this.charts[chartName].toBase64Image();
            const link = document.createElement('a');
            link.download = filename || `${chartName}.png`;
            link.href = url;
            link.click();
        }
    }

    // Destroy all charts (cleanup)
    destroyCharts() {
        Object.values(this.charts).forEach(chart => {
            chart.destroy();
        });
        this.charts = {};
    }
}

// Initialize Analytics Manager
window.analyticsManager = new AnalyticsManager();

// Export for use in other modules
window.AnalyticsManager = AnalyticsManager;

console.log('✅ Advanced Analytics Manager loaded successfully');
