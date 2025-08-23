#!/bin/bash

# QR Attendance System - Final Automated Testing Script
# This script automates testing and provides guidance for manual steps

echo "🎯 QR ATTENDANCE SYSTEM - FINAL TESTING"
echo "======================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results tracking
TESTS_PASSED=0
TESTS_FAILED=0
MANUAL_TESTS_PENDING=0

echo -e "${BLUE}Starting comprehensive system testing...${NC}"
echo ""

# Function to check if server is running
check_server() {
    echo "🌐 Checking local development server..."
    if curl -s http://localhost:8000 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Server is running on http://localhost:8000${NC}"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}❌ Server is not running${NC}"
        echo "   Starting server..."
        python3 -m http.server 8000 &
        SERVER_PID=$!
        sleep 3
        if curl -s http://localhost:8000 > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Server started successfully${NC}"
            ((TESTS_PASSED++))
            return 0
        else
            echo -e "${RED}❌ Failed to start server${NC}"
            ((TESTS_FAILED++))
            return 1
        fi
    fi
}

# Function to check file existence
check_files() {
    echo ""
    echo "📁 Checking essential files..."
    
    files=(
        "index.html"
        "login.html" 
        "home.html"
        "qr-scanner.html"
        "supabase-config.js"
        "simplified-db-setup.sql"
        "final-verification.html"
        "mobile-test.html"
        "test-progress-tracker.html"
    )
    
    for file in "${files[@]}"; do
        if [ -f "$file" ]; then
            echo -e "${GREEN}✅ $file exists${NC}"
            ((TESTS_PASSED++))
        else
            echo -e "${RED}❌ $file missing${NC}"
            ((TESTS_FAILED++))
        fi
    done
}

# Function to check JavaScript dependencies
check_js_dependencies() {
    echo ""
    echo "📦 Checking JavaScript dependencies..."
    
    # Check if we can fetch the main pages
    if curl -s http://localhost:8000/final-verification.html | grep -q "supabase-js"; then
        echo -e "${GREEN}✅ Supabase JS library referenced${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ Supabase JS library not found${NC}"
        ((TESTS_FAILED++))
    fi
    
    if curl -s http://localhost:8000/final-verification.html | grep -q "qrcode"; then
        echo -e "${GREEN}✅ QRCode.js library referenced${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ QRCode.js library not found${NC}"
        ((TESTS_FAILED++))
    fi
    
    if curl -s http://localhost:8000/final-verification.html | grep -q "html5-qrcode"; then
        echo -e "${GREEN}✅ html5-qrcode library referenced${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ html5-qrcode library not found${NC}"
        ((TESTS_FAILED++))
    fi
}

# Function to validate configuration
check_configuration() {
    echo ""
    echo "⚙️ Checking configuration..."
    
    if [ -f "supabase-config.js" ]; then
        if grep -q "supabaseUrl" supabase-config.js && grep -q "supabaseAnonKey" supabase-config.js; then
            echo -e "${GREEN}✅ Supabase configuration file has required fields${NC}"
            ((TESTS_PASSED++))
        else
            echo -e "${RED}❌ Supabase configuration missing required fields${NC}"
            ((TESTS_FAILED++))
        fi
    else
        echo -e "${RED}❌ Supabase configuration file not found${NC}"
        ((TESTS_FAILED++))
    fi
}

# Function to check database setup
check_database_setup() {
    echo ""
    echo "🗄️ Checking database setup script..."
    
    if [ -f "simplified-db-setup.sql" ]; then
        # Check for essential tables
        if grep -q "CREATE TABLE.*profiles" simplified-db-setup.sql; then
            echo -e "${GREEN}✅ Profiles table definition found${NC}"
            ((TESTS_PASSED++))
        else
            echo -e "${RED}❌ Profiles table definition missing${NC}"
            ((TESTS_FAILED++))
        fi
        
        if grep -q "CREATE TABLE.*qr_attendance_sessions" simplified-db-setup.sql; then
            echo -e "${GREEN}✅ QR attendance sessions table definition found${NC}"
            ((TESTS_PASSED++))
        else
            echo -e "${RED}❌ QR attendance sessions table definition missing${NC}"
            ((TESTS_FAILED++))
        fi
        
        if grep -q "mark_attendance_qr" simplified-db-setup.sql; then
            echo -e "${GREEN}✅ Attendance marking function found${NC}"
            ((TESTS_PASSED++))
        else
            echo -e "${RED}❌ Attendance marking function missing${NC}"
            ((TESTS_FAILED++))
        fi
        
        if grep -q "ENABLE ROW LEVEL SECURITY" simplified-db-setup.sql; then
            echo -e "${GREEN}✅ Row Level Security policies found${NC}"
            ((TESTS_PASSED++))
        else
            echo -e "${RED}❌ Row Level Security policies missing${NC}"
            ((TESTS_FAILED++))
        fi
    else
        echo -e "${RED}❌ Database setup script not found${NC}"
        ((TESTS_FAILED++))
    fi
}

# Function to check responsive design
check_responsive_design() {
    echo ""
    echo "📱 Checking responsive design..."
    
    files_to_check=("index.html" "login.html" "home.html" "qr-scanner.html")
    
    for file in "${files_to_check[@]}"; do
        if [ -f "$file" ]; then
            if grep -q "viewport" "$file" && grep -q "width=device-width" "$file"; then
                echo -e "${GREEN}✅ $file has responsive viewport meta tag${NC}"
                ((TESTS_PASSED++))
            else
                echo -e "${RED}❌ $file missing responsive viewport${NC}"
                ((TESTS_FAILED++))
            fi
        fi
    done
}

# Function to display manual testing steps
show_manual_tests() {
    echo ""
    echo -e "${YELLOW}📋 MANUAL TESTING REQUIRED${NC}"
    echo "================================="
    echo ""
    
    echo -e "${BLUE}1. DATABASE SETUP (Required)${NC}"
    echo "   • Open: https://supabase.com/dashboard"
    echo "   • Go to SQL Editor"
    echo "   • Run the contents of: simplified-db-setup.sql"
    echo "   • Verify all tables are created"
    echo ""
    
    echo -e "${BLUE}2. SYSTEM VERIFICATION${NC}"
    echo "   • Open: http://localhost:8000/final-verification.html"
    echo "   • Click 'Run All Tests'"
    echo "   • Ensure all tests pass"
    echo ""
    
    echo -e "${BLUE}3. CREATE TEST ACCOUNTS${NC}"
    echo "   • Open: http://localhost:8000/login.html"
    echo "   • Create Teacher Account:"
    echo "     - Email: teacher.test@demo.com"
    echo "     - Password: TestTeacher123!"
    echo "   • Create Student Account:"
    echo "     - Email: student.test@demo.com"
    echo "     - Password: TestStudent123!"
    echo ""
    
    echo -e "${BLUE}4. TEST QR GENERATION${NC}"
    echo "   • Login as teacher"
    echo "   • Open: http://localhost:8000/home.html"
    echo "   • Generate QR code for attendance"
    echo "   • Note the QR code data"
    echo ""
    
    echo -e "${BLUE}5. TEST QR SCANNING${NC}"
    echo "   • Login as student"
    echo "   • Open: http://localhost:8000/qr-scanner.html"
    echo "   • Scan the generated QR code"
    echo "   • Verify attendance is marked"
    echo ""
    
    echo -e "${BLUE}6. MOBILE TESTING${NC}"
    echo "   • Open: http://localhost:8000/mobile-test.html"
    echo "   • Test on actual mobile device"
    echo "   • Verify camera access and QR scanning"
    echo ""
    
    echo -e "${BLUE}7. PROGRESS TRACKING${NC}"
    echo "   • Open: http://localhost:8000/test-progress-tracker.html"
    echo "   • Mark completed tasks as you go"
    echo "   • Generate final report when done"
    echo ""
    
    ((MANUAL_TESTS_PENDING += 7))
}

# Function to open test pages
open_test_pages() {
    echo ""
    echo "🌐 Opening test pages in browser..."
    
    # Check if we're on macOS or Linux
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        open "http://localhost:8000/test-progress-tracker.html"
        sleep 1
        open "http://localhost:8000/final-verification.html"
        sleep 1
        open "http://localhost:8000/system-status.html"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        xdg-open "http://localhost:8000/test-progress-tracker.html"
        sleep 1
        xdg-open "http://localhost:8000/final-verification.html"
        sleep 1
        xdg-open "http://localhost:8000/system-status.html"
    else
        echo "   Please manually open these URLs:"
        echo "   - http://localhost:8000/test-progress-tracker.html"
        echo "   - http://localhost:8000/final-verification.html"
        echo "   - http://localhost:8000/system-status.html"
    fi
}

# Function to display final results
show_results() {
    echo ""
    echo "📊 AUTOMATED TEST RESULTS"
    echo "=========================="
    echo -e "${GREEN}Tests Passed: $TESTS_PASSED${NC}"
    echo -e "${RED}Tests Failed: $TESTS_FAILED${NC}"
    echo -e "${YELLOW}Manual Tests Pending: $MANUAL_TESTS_PENDING${NC}"
    echo ""
    
    TOTAL_AUTO_TESTS=$((TESTS_PASSED + TESTS_FAILED))
    if [ $TOTAL_AUTO_TESTS -gt 0 ]; then
        SUCCESS_RATE=$((TESTS_PASSED * 100 / TOTAL_AUTO_TESTS))
        echo "Automated Success Rate: ${SUCCESS_RATE}%"
    fi
    
    echo ""
    if [ $TESTS_FAILED -eq 0 ]; then
        echo -e "${GREEN}🎉 All automated tests passed!${NC}"
        echo -e "${GREEN}✅ System is ready for manual testing${NC}"
    else
        echo -e "${RED}⚠️  Some automated tests failed${NC}"
        echo -e "${YELLOW}📋 Please fix the issues before manual testing${NC}"
    fi
    
    echo ""
    echo -e "${BLUE}📋 NEXT STEPS:${NC}"
    echo "1. Complete the manual testing steps above"
    echo "2. Use the progress tracker to monitor completion"
    echo "3. Generate final report when all tests pass"
    echo "4. Deploy to production when ready"
    echo ""
    echo -e "${GREEN}🚀 Your QR Attendance System is almost ready!${NC}"
}

# Main execution
echo "Starting automated tests..."

check_server
check_files
check_js_dependencies
check_configuration
check_database_setup
check_responsive_design

show_manual_tests
open_test_pages
show_results

echo ""
echo "🎯 Testing script completed!"
echo "Follow the manual testing steps to complete verification."
