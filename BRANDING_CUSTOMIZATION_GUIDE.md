# HH310 Academic System - Branding & Customization Guide

## 🎨 Complete Branding Customization for Your Institution

### Quick Customization Script

Run this script to quickly customize the system for your institution:

```bash
#!/bin/bash
# Quick branding customization script

echo "🎨 HH310 Academic System - Branding Customization"
echo "=================================================="

# Get institution details
read -p "Institution Name: " INSTITUTION_NAME
read -p "Institution Abbreviation (e.g., MIT, UCLA): " INSTITUTION_ABBREV
read -p "Primary Color (hex, e.g., #1f2937): " PRIMARY_COLOR
read -p "Secondary Color (hex, e.g., #3b82f6): " SECONDARY_COLOR
read -p "Website URL: " WEBSITE_URL
read -p "Logo filename (place in assets/): " LOGO_FILENAME

# Apply customizations
sed -i "s/HH310 Academic System/$INSTITUTION_NAME Academic System/g" deployment/production/index.html
sed -i "s/Your Institution Name/$INSTITUTION_NAME/g" deployment/production/config/production-config.js
sed -i "s/#1f2937/$PRIMARY_COLOR/g" deployment/production/index.html
sed -i "s/#3b82f6/$SECONDARY_COLOR/g" deployment/production/index.html

echo "✅ Branding applied successfully!"
```

## 🏫 Institution-Specific Customizations

### 1. Logo and Visual Identity

**Add Your Logo:**
```html
<!-- In the header section -->
<div class="institution-header">
    <img src="assets/your-logo.png" alt="Institution Logo" class="institution-logo">
    <h1>Your Institution Academic System</h1>
</div>
```

**CSS for Logo:**
```css
.institution-logo {
    height: 60px;
    width: auto;
    margin-right: 15px;
}

.institution-header {
    display: flex;
    align-items: center;
    padding: 20px;
    background: var(--primary-color);
    color: white;
}
```

### 2. Color Scheme Customization

**Primary Colors (Update CSS Variables):**
```css
:root {
    /* Your Institution Colors */
    --primary-color: #your-primary-color;
    --secondary-color: #your-secondary-color;
    --accent-color: #your-accent-color;
    
    /* Examples for different institutions */
    
    /* Harvard Style */
    --harvard-crimson: #a41e22;
    --harvard-black: #1e1e1e;
    
    /* MIT Style */
    --mit-red: #750014;
    --mit-gray: #8a8b8c;
    
    /* Stanford Style */
    --stanford-red: #8c1515;
    --stanford-dark-red: #820000;
    
    /* UCLA Style */
    --ucla-blue: #2774ae;
    --ucla-gold: #ffd100;
    
    /* Oxford Style */
    --oxford-blue: #002147;
    --oxford-light: #70a9d4;
}

/* Apply to key elements */
.nav-tab.active {
    background-color: var(--primary-color);
    border-bottom-color: var(--secondary-color);
}

.btn--primary {
    background-color: var(--primary-color);
}

.btn--secondary {
    background-color: var(--secondary-color);
}
```

### 3. Typography and Fonts

**Custom Institution Font:**
```css
/* Add Google Fonts or your institution's font */
@import url('https://fonts.googleapis.com/css2?family=Your-Institution-Font:wght@300;400;500;600;700&display=swap');

:root {
    --institution-font: 'Your Institution Font', 'Roboto', sans-serif;
    --heading-font: 'Your Heading Font', 'Roboto Slab', serif;
}

body {
    font-family: var(--institution-font);
}

h1, h2, h3, h4, h5, h6 {
    font-family: var(--heading-font);
}
```

### 4. Custom Layouts for Different Institution Types

**University Layout:**
```css
/* Large university with multiple colleges */
.university-layout {
    display: grid;
    grid-template-columns: 250px 1fr;
    min-height: 100vh;
}

.college-sidebar {
    background: var(--primary-color);
    color: white;
    padding: 20px;
}

.college-selector {
    margin-bottom: 20px;
}
```

**School Layout:**
```css
/* Smaller school/high school layout */
.school-layout {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.school-header {
    text-align: center;
    margin-bottom: 30px;
}
```

### 5. Department-Specific Customizations

**Science Departments:**
```css
.science-theme {
    --primary-color: #0f4c81; /* Deep blue */
    --secondary-color: #2196f3; /* Light blue */
    --accent-color: #00bcd4; /* Cyan */
}

.science-icons::before {
    content: "🔬";
    margin-right: 10px;
}
```

**Engineering Departments:**
```css
.engineering-theme {
    --primary-color: #ff6f00; /* Orange */
    --secondary-color: #ffa726; /* Light orange */
    --accent-color: #ffcc02; /* Yellow */
}

.engineering-icons::before {
    content: "⚙️";
    margin-right: 10px;
}
```

**Liberal Arts:**
```css
.liberal-arts-theme {
    --primary-color: #4a148c; /* Purple */
    --secondary-color: #7b1fa2; /* Light purple */
    --accent-color: #ab47bc; /* Pink */
}

.liberal-arts-icons::before {
    content: "📚";
    margin-right: 10px;
}
```

## 🌍 Internationalization

### Language Support

**Create language files:**
```javascript
// languages/en.js
const EN_STRINGS = {
    appTitle: "Academic Management System",
    timetableCreation: "Timetable Creation",
    attendanceTracking: "Attendance Tracking",
    generateTimetable: "Generate Timetable",
    markAttendance: "Mark Attendance",
    // ... more strings
};

// languages/es.js
const ES_STRINGS = {
    appTitle: "Sistema de Gestión Académica",
    timetableCreation: "Creación de Horarios",
    attendanceTracking: "Seguimiento de Asistencia",
    generateTimetable: "Generar Horario",
    markAttendance: "Marcar Asistencia",
    // ... more strings
};
```

**Language switcher:**
```javascript
class LanguageManager {
    constructor() {
        this.currentLanguage = localStorage.getItem('language') || 'en';
        this.strings = this.loadLanguage(this.currentLanguage);
    }
    
    loadLanguage(lang) {
        switch(lang) {
            case 'es': return ES_STRINGS;
            case 'fr': return FR_STRINGS;
            default: return EN_STRINGS;
        }
    }
    
    setLanguage(lang) {
        this.currentLanguage = lang;
        this.strings = this.loadLanguage(lang);
        localStorage.setItem('language', lang);
        this.updateUI();
    }
    
    updateUI() {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            element.textContent = this.strings[key] || key;
        });
    }
}
```

### Time Zone Support

```javascript
// Institution-specific time zone
const INSTITUTION_CONFIG = {
    timezone: 'America/New_York', // Your institution's timezone
    dateFormat: 'MM/DD/YYYY', // US format
    timeFormat: '12', // 12-hour or 24-hour
    weekStart: 1, // Monday = 1, Sunday = 0
};

class TimeManager {
    constructor(config) {
        this.timezone = config.timezone;
        this.dateFormat = config.dateFormat;
        this.timeFormat = config.timeFormat;
    }
    
    formatDate(date) {
        return new Intl.DateTimeFormat('en-US', {
            timeZone: this.timezone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(date);
    }
    
    formatTime(date) {
        return new Intl.DateTimeFormat('en-US', {
            timeZone: this.timezone,
            hour: '2-digit',
            minute: '2-digit',
            hour12: this.timeFormat === '12'
        }).format(date);
    }
}
```

## 🏗️ Institution-Specific Features

### 1. Academic Calendar Integration

```javascript
class AcademicCalendar {
    constructor(institutionConfig) {
        this.config = institutionConfig;
        this.loadAcademicYear();
    }
    
    loadAcademicYear() {
        // Load institution-specific academic calendar
        this.academicYear = {
            startDate: new Date('2024-08-15'),
            endDate: new Date('2025-05-15'),
            semesters: [
                { name: 'Fall 2024', start: '2024-08-15', end: '2024-12-15' },
                { name: 'Spring 2025', start: '2025-01-15', end: '2025-05-15' }
            ],
            holidays: [
                { name: 'Labor Day', date: '2024-09-02' },
                { name: 'Thanksgiving', date: '2024-11-28' },
                // ... more holidays
            ]
        };
    }
    
    isHoliday(date) {
        return this.academicYear.holidays.some(holiday => 
            holiday.date === date.toISOString().split('T')[0]
        );
    }
}
```

### 2. Grading System Integration

```javascript
class GradingSystem {
    constructor(institutionType) {
        this.scales = {
            'university': {
                'A+': 4.0, 'A': 4.0, 'A-': 3.7,
                'B+': 3.3, 'B': 3.0, 'B-': 2.7,
                'C+': 2.3, 'C': 2.0, 'C-': 1.7,
                'D+': 1.3, 'D': 1.0, 'F': 0.0
            },
            'high_school': {
                'A': 90, 'B': 80, 'C': 70, 'D': 60, 'F': 0
            },
            'international': {
                'First Class': 70, 'Upper Second': 60,
                'Lower Second': 50, 'Third Class': 40, 'Fail': 0
            }
        };
        this.currentScale = this.scales[institutionType] || this.scales['university'];
    }
}
```

### 3. Attendance Policies

```javascript
class AttendancePolicy {
    constructor(institutionRules) {
        this.rules = {
            minimumAttendance: institutionRules.minimumAttendance || 75,
            graceePeriod: institutionRules.gracePeriod || 10, // minutes
            excusedAbsenceLimit: institutionRules.excusedLimit || 3,
            warningThreshold: institutionRules.warningThreshold || 65,
            ...institutionRules
        };
    }
    
    calculateAttendanceStatus(student) {
        const attendanceRate = student.attendancePercentage;
        
        if (attendanceRate < this.rules.warningThreshold) {
            return { status: 'warning', message: 'Low attendance warning' };
        } else if (attendanceRate < this.rules.minimumAttendance) {
            return { status: 'critical', message: 'Below minimum attendance' };
        } else {
            return { status: 'good', message: 'Good attendance' };
        }
    }
}
```

## 📱 Mobile App Branding

### PWA Customization

```json
{
  "name": "Your Institution Academic System",
  "short_name": "YourInst Academic",
  "description": "Academic management system for Your Institution",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#your-primary-color",
  "theme_color": "#your-secondary-color",
  "icons": [
    {
      "src": "assets/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "assets/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Mobile-Specific Styling

```css
/* Institution-specific mobile optimizations */
@media (max-width: 768px) {
    .institution-header {
        padding: 10px;
        flex-direction: column;
        text-align: center;
    }
    
    .institution-logo {
        height: 40px;
        margin-bottom: 10px;
    }
    
    .mobile-navigation {
        background: var(--primary-color);
        position: fixed;
        bottom: 0;
        width: 100%;
        z-index: 1000;
    }
}
```

## 🎓 Institution Type Templates

### Community College Template

```css
.community-college-theme {
    --primary-color: #2e7d32; /* Green */
    --secondary-color: #4caf50;
    --accent-color: #81c784;
    --font-size-base: 16px; /* Larger for accessibility */
}

.community-college-layout {
    /* Simplified, accessibility-focused layout */
    max-width: 1000px;
    margin: 0 auto;
    font-size: var(--font-size-base);
}
```

### Private School Template

```css
.private-school-theme {
    --primary-color: #1a237e; /* Navy */
    --secondary-color: #3f51b5;
    --accent-color: #7986cb;
    --font-family: 'Times New Roman', serif; /* Traditional */
}

.private-school-header {
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    padding: 30px;
    text-align: center;
}
```

### Technical Institute Template

```css
.technical-institute-theme {
    --primary-color: #ff5722; /* Orange-red */
    --secondary-color: #ff9800;
    --accent-color: #ffcc02;
    --font-family: 'Roboto Mono', monospace; /* Technical feel */
}

.tech-dashboard {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
}
```

## 🚀 Quick Deployment with Branding

### Docker Configuration

```dockerfile
# Dockerfile for containerized deployment
FROM nginx:alpine

# Copy branded application files
COPY deployment/production/ /usr/share/nginx/html/

# Copy custom nginx configuration
COPY deployment/production/config/nginx.conf /etc/nginx/conf.d/default.conf

# Add institution-specific environment variables
ENV INSTITUTION_NAME="Your Institution"
ENV PRIMARY_COLOR="#1f2937"
ENV SECONDARY_COLOR="#3b82f6"

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Environment-based Configuration

```javascript
// config/environment.js
const ENVIRONMENT_CONFIG = {
    development: {
        supabaseUrl: 'http://localhost:54321',
        institutionName: 'Your Institution (Dev)',
        primaryColor: '#6b7280', // Gray for dev
        enableDebug: true
    },
    staging: {
        supabaseUrl: 'https://staging-project.supabase.co',
        institutionName: 'Your Institution (Staging)',
        primaryColor: '#f59e0b', // Orange for staging
        enableDebug: true
    },
    production: {
        supabaseUrl: 'https://production-project.supabase.co',
        institutionName: 'Your Institution',
        primaryColor: '#1f2937', // Your brand color
        enableDebug: false
    }
};

// Auto-detect environment
const currentEnv = window.location.hostname.includes('localhost') ? 'development' :
                   window.location.hostname.includes('staging') ? 'staging' : 'production';

window.CURRENT_CONFIG = ENVIRONMENT_CONFIG[currentEnv];
```

---

## ✅ Branding Checklist

### Visual Identity
- ✅ Logo added and properly sized
- ✅ Color scheme applied consistently
- ✅ Typography customized
- ✅ Favicon updated
- ✅ Mobile icons created

### Content Customization
- ✅ Institution name updated throughout
- ✅ Contact information added
- ✅ Academic calendar configured
- ✅ Attendance policies customized
- ✅ Grading system configured

### Technical Configuration
- ✅ Environment variables set
- ✅ Domain configuration updated
- ✅ SSL certificates installed
- ✅ PWA manifest customized
- ✅ Analytics configured

### Testing
- ✅ Visual consistency across devices
- ✅ Brand colors display correctly
- ✅ Logo appears properly scaled
- ✅ Institution-specific data loads
- ✅ Mobile branding functional

---

*Your HH310 Academic System is now fully branded and ready for your institution! 🎓*
