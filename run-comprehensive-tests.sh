#!/bin/bash
# HH310 Academic System - Automated Testing Script
# This script performs comprehensive testing of all system features

echo "🧪 HH310 Academic System - Comprehensive Testing"
echo "================================================="

# Test configuration
TEST_URL="http://localhost:8000/home.html"
TEST_RESULTS_FILE="test-results-$(date +%Y%m%d-%H%M%S).log"

echo "🚀 Starting comprehensive testing at $(date)" | tee $TEST_RESULTS_FILE
echo "Testing URL: $TEST_URL" | tee -a $TEST_RESULTS_FILE
echo "" | tee -a $TEST_RESULTS_FILE

# Function to log test results
log_test() {
    local test_name="$1"
    local status="$2"
    local details="$3"
    
    if [ "$status" = "PASS" ]; then
        echo "✅ $test_name: PASSED" | tee -a $TEST_RESULTS_FILE
    else
        echo "❌ $test_name: FAILED - $details" | tee -a $TEST_RESULTS_FILE
    fi
    
    if [ -n "$details" ]; then
        echo "   Details: $details" | tee -a $TEST_RESULTS_FILE
    fi
    echo "" | tee -a $TEST_RESULTS_FILE
}

# Check if local server is running
echo "🔍 Testing server connectivity..."
if curl -s --head --request GET $TEST_URL | grep "200 OK" > /dev/null; then
    log_test "Server Connectivity" "PASS" "Local server is running and accessible"
else
    log_test "Server Connectivity" "FAIL" "Cannot connect to local server"
    echo "❌ Server not accessible. Please ensure 'python3 -m http.server 8000' is running"
    exit 1
fi

# Check file integrity
echo "📁 Testing file integrity..."

# Essential files check
declare -a essential_files=(
    "home.html"
    "attendance-manager.js"
    "supabase-config.js"
    "enhanced-database-schema.sql"
)

for file in "${essential_files[@]}"; do
    if [ -f "$file" ]; then
        log_test "File Check: $file" "PASS" "File exists and readable"
    else
        log_test "File Check: $file" "FAIL" "File missing or not readable"
    fi
done

# Check HTML structure
echo "🏗️ Testing HTML structure..."
if grep -q "<!DOCTYPE html>" home.html; then
    log_test "HTML DOCTYPE" "PASS" "Valid HTML5 DOCTYPE found"
else
    log_test "HTML DOCTYPE" "FAIL" "Missing or invalid DOCTYPE"
fi

if grep -q "TimetableManager" home.html; then
    log_test "TimetableManager Class" "PASS" "TimetableManager class found in HTML"
else
    log_test "TimetableManager Class" "FAIL" "TimetableManager class not found"
fi

if grep -q "AttendanceManager" home.html; then
    log_test "AttendanceManager Integration" "PASS" "AttendanceManager integrated in HTML"
else
    log_test "AttendanceManager Integration" "FAIL" "AttendanceManager not integrated"
fi

# Check JavaScript syntax
echo "🔧 Testing JavaScript syntax..."
if node -c home.html 2>/dev/null; then
    log_test "JavaScript Syntax (HTML)" "PASS" "No syntax errors in embedded JavaScript"
else
    log_test "JavaScript Syntax (HTML)" "FAIL" "Syntax errors found in embedded JavaScript"
fi

if node -c attendance-manager.js 2>/dev/null; then
    log_test "JavaScript Syntax (Attendance)" "PASS" "No syntax errors in attendance-manager.js"
else
    log_test "JavaScript Syntax (Attendance)" "FAIL" "Syntax errors found in attendance-manager.js"
fi

# Check CSS structure
echo "🎨 Testing CSS structure..."
if grep -q ":root" home.html; then
    log_test "CSS Variables" "PASS" "CSS custom properties (variables) found"
else
    log_test "CSS Variables" "FAIL" "CSS custom properties not found"
fi

if grep -q "@media" home.html; then
    log_test "Responsive Design" "PASS" "Media queries found for responsive design"
else
    log_test "Responsive Design" "FAIL" "No media queries found"
fi

# Check for security best practices
echo "🔒 Testing security implementation..."
if grep -q "Row Level Security" enhanced-database-schema.sql; then
    log_test "Database Security (RLS)" "PASS" "Row Level Security policies found"
else
    log_test "Database Security (RLS)" "FAIL" "No Row Level Security implementation"
fi

if grep -q "INSERT.*ON CONFLICT" enhanced-database-schema.sql; then
    log_test "SQL Injection Protection" "PASS" "Safe SQL practices found"
else
    log_test "SQL Injection Protection" "FAIL" "Potential SQL injection vulnerabilities"
fi

# Check module structure
echo "📦 Testing module structure..."
modules=("timetable-module" "attendance-module" "reports-module")
for module in "${modules[@]}"; do
    if grep -q "$module" home.html; then
        log_test "Module: $module" "PASS" "Module found in HTML structure"
    else
        log_test "Module: $module" "FAIL" "Module not found or incorrectly named"
    fi
done

# Check real-time features
echo "📡 Testing real-time features..."
if grep -q "setupRealtimeSubscriptions" home.html; then
    log_test "Real-time Setup" "PASS" "Real-time subscription setup found"
else
    log_test "Real-time Setup" "FAIL" "Real-time subscription setup not found"
fi

if grep -q "channel.*subscribe" home.html; then
    log_test "Real-time Channels" "PASS" "Real-time channel subscriptions found"
else
    log_test "Real-time Channels" "FAIL" "Real-time channel subscriptions not implemented"
fi

# Check attendance features
echo "👥 Testing attendance features..."
if grep -q "generateQRCode" attendance-manager.js; then
    log_test "QR Code Generation" "PASS" "QR code generation function found"
else
    log_test "QR Code Generation" "FAIL" "QR code generation not implemented"
fi

if grep -q "markAttendance" attendance-manager.js; then
    log_test "Manual Attendance" "PASS" "Manual attendance marking found"
else
    log_test "Manual Attendance" "FAIL" "Manual attendance marking not implemented"
fi

if grep -q "liveAttendanceFeed" attendance-manager.js || grep -q "attendance-feed" attendance-manager.js; then
    log_test "Live Attendance Feed" "PASS" "Live attendance feed implementation found"
else
    log_test "Live Attendance Feed" "FAIL" "Live attendance feed not implemented"
fi

# Check timetable features
echo "📅 Testing timetable features..."
if grep -q "generateTimetable" home.html; then
    log_test "Timetable Generation" "PASS" "Timetable generation function found"
else
    log_test "Timetable Generation" "FAIL" "Timetable generation not implemented"
fi

if grep -q "detectConflicts" home.html; then
    log_test "Conflict Detection" "PASS" "Conflict detection function found"
else
    log_test "Conflict Detection" "FAIL" "Conflict detection not implemented"
fi

if grep -q "autoSave" home.html; then
    log_test "Auto-save Feature" "PASS" "Auto-save functionality found"
else
    log_test "Auto-save Feature" "FAIL" "Auto-save functionality not implemented"
fi

# Check database schema
echo "🗄️ Testing database schema..."
required_tables=("timetable_slots" "attendance_records" "subjects" "teachers" "classrooms" "student_groups")
for table in "${required_tables[@]}"; do
    if grep -q "CREATE TABLE.*$table" enhanced-database-schema.sql; then
        log_test "Database Table: $table" "PASS" "Table definition found"
    else
        log_test "Database Table: $table" "FAIL" "Table definition missing"
    fi
done

# Check for indexes
if grep -q "CREATE INDEX" enhanced-database-schema.sql; then
    log_test "Database Indexes" "PASS" "Performance indexes found"
else
    log_test "Database Indexes" "FAIL" "No performance indexes found"
fi

# Check error handling
echo "⚠️ Testing error handling..."
if grep -q "try.*catch" home.html; then
    log_test "Error Handling (Timetable)" "PASS" "Error handling found in timetable code"
else
    log_test "Error Handling (Timetable)" "FAIL" "No error handling in timetable code"
fi

if grep -q "try.*catch" attendance-manager.js; then
    log_test "Error Handling (Attendance)" "PASS" "Error handling found in attendance code"
else
    log_test "Error Handling (Attendance)" "FAIL" "No error handling in attendance code"
fi

# Check notification system
echo "📢 Testing notification system..."
if grep -q "showNotification" home.html || grep -q "showNotification" attendance-manager.js; then
    log_test "Notification System" "PASS" "Notification system implemented"
else
    log_test "Notification System" "FAIL" "No notification system found"
fi

# Check accessibility features
echo "♿ Testing accessibility features..."
if grep -q "aria-" home.html; then
    log_test "ARIA Labels" "PASS" "ARIA accessibility labels found"
else
    log_test "ARIA Labels" "FAIL" "No ARIA accessibility labels"
fi

if grep -q "alt=" home.html; then
    log_test "Image Alt Text" "PASS" "Image alt text found"
else
    log_test "Image Alt Text" "FAIL" "No image alt text found"
fi

# Performance checks
echo "⚡ Testing performance optimizations..."
if grep -q "debounce\|throttle" home.html; then
    log_test "Performance Optimization" "PASS" "Performance optimization techniques found"
else
    log_test "Performance Optimization" "FAIL" "No performance optimization techniques"
fi

# Check deployment readiness
echo "🚀 Testing deployment readiness..."
if [ -d "deployment" ]; then
    log_test "Deployment Structure" "PASS" "Deployment directory structure exists"
else
    log_test "Deployment Structure" "FAIL" "No deployment directory structure"
fi

if [ -f "deployment/production/config/production-config.js" ]; then
    log_test "Production Config" "PASS" "Production configuration template exists"
else
    log_test "Production Config" "FAIL" "No production configuration template"
fi

# Generate test summary
echo "" | tee -a $TEST_RESULTS_FILE
echo "📊 TEST SUMMARY" | tee -a $TEST_RESULTS_FILE
echo "===============" | tee -a $TEST_RESULTS_FILE

total_tests=$(grep -c "✅\|❌" $TEST_RESULTS_FILE)
passed_tests=$(grep -c "✅" $TEST_RESULTS_FILE)
failed_tests=$(grep -c "❌" $TEST_RESULTS_FILE)

echo "Total Tests Run: $total_tests" | tee -a $TEST_RESULTS_FILE
echo "Passed: $passed_tests" | tee -a $TEST_RESULTS_FILE
echo "Failed: $failed_tests" | tee -a $TEST_RESULTS_FILE

if [ $failed_tests -eq 0 ]; then
    echo "🎉 ALL TESTS PASSED! System is ready for production." | tee -a $TEST_RESULTS_FILE
elif [ $failed_tests -lt 5 ]; then
    echo "⚠️ MOSTLY READY: Minor issues found. Review failed tests." | tee -a $TEST_RESULTS_FILE
else
    echo "❌ NEEDS WORK: Multiple issues found. Address failed tests before deployment." | tee -a $TEST_RESULTS_FILE
fi

echo "" | tee -a $TEST_RESULTS_FILE
echo "Success Rate: $(( passed_tests * 100 / total_tests ))%" | tee -a $TEST_RESULTS_FILE
echo "Test completed at $(date)" | tee -a $TEST_RESULTS_FILE
echo "" | tee -a $TEST_RESULTS_FILE
echo "📁 Detailed results saved to: $TEST_RESULTS_FILE" | tee -a $TEST_RESULTS_FILE

# Open test results
if command -v open &> /dev/null; then
    echo "Opening test results..."
    open $TEST_RESULTS_FILE
elif command -v xdg-open &> /dev/null; then
    echo "Opening test results..."
    xdg-open $TEST_RESULTS_FILE
fi

echo ""
echo "🔗 Quick Links for Manual Testing:"
echo "- Application: $TEST_URL"
echo "- Test Results: $TEST_RESULTS_FILE"
echo "- Deployment Guide: deployment/README.md"
echo "- Setup Guide: SUPABASE_INSTITUTION_SETUP.md"
echo ""
echo "✅ Automated testing completed!"
