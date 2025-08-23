#!/bin/bash

# QR Attendance System - Quick Test Script
# This script helps you quickly test all components of the QR attendance system

echo "🎯 QR Attendance System - Quick Test Script"
echo "=========================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    case $2 in
        "success") echo -e "${GREEN}✅ $1${NC}" ;;
        "error") echo -e "${RED}❌ $1${NC}" ;;
        "warning") echo -e "${YELLOW}⚠️  $1${NC}" ;;
        "info") echo -e "${BLUE}ℹ️  $1${NC}" ;;
        *) echo "$1" ;;
    esac
}

# Check if we're in the correct directory
if [ ! -f "index.html" ] || [ ! -f "qr-scanner.html" ]; then
    print_status "Please run this script from the QR attendance system directory" "error"
    exit 1
fi

print_status "Starting system check..." "info"
echo ""

# 1. Check required files
print_status "1. Checking required files..." "info"
required_files=("index.html" "login.html" "home.html" "qr-scanner.html" "supabase-config.js" "qr-attendance-setup.sql")

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        print_status "$file found" "success"
    else
        print_status "$file missing" "error"
    fi
done
echo ""

# 2. Check Supabase configuration
print_status "2. Checking Supabase configuration..." "info"
if grep -q "YOUR_SUPABASE_PROJECT_URL" supabase-config.js; then
    print_status "Supabase URL not configured" "warning"
    print_status "Please update supabase-config.js with your credentials" "warning"
else
    print_status "Supabase configuration looks updated" "success"
fi

if grep -q "YOUR_SUPABASE_ANON_KEY" supabase-config.js; then
    print_status "Supabase anon key not configured" "warning"
else
    print_status "Supabase anon key configured" "success"
fi
echo ""

# 3. Check if running on HTTPS (required for camera access)
print_status "3. Checking HTTPS requirement..." "info"
if command -v python3 &> /dev/null; then
    print_status "Python 3 found - can start local server" "success"
elif command -v python &> /dev/null; then
    print_status "Python found - can start local server" "success"
elif command -v node &> /dev/null; then
    print_status "Node.js found - can use http-server" "success"
else
    print_status "No local server tools found" "warning"
    print_status "Consider installing Python or Node.js for local testing" "warning"
fi
echo ""

# 4. Database setup check
print_status "4. Database setup instructions..." "info"
print_status "Run the following SQL in your Supabase SQL Editor:" "info"
print_status "1. Open your Supabase dashboard" "info"
print_status "2. Go to SQL Editor" "info"
print_status "3. Run the contents of qr-attendance-setup.sql" "info"
echo ""

# 5. Testing checklist
print_status "5. Testing Checklist:" "info"
echo "   📋 Create Supabase project and update config"
echo "   📋 Run database setup SQL"
echo "   📋 Start local server with HTTPS"
echo "   📋 Open index.html in browser"
echo "   📋 Test user registration/login"
echo "   📋 Generate QR code in attendance module"
echo "   📋 Test QR scanning with camera"
echo "   📋 Verify real-time updates"
echo ""

# 6. Quick start commands
print_status "6. Quick Start Commands:" "info"
echo ""
echo "Start local Python server:"
echo "  python3 -m http.server 8080"
echo "  # or"
echo "  python -m http.server 8080"
echo ""
echo "Start Node.js server (if http-server installed):"
echo "  npx http-server -p 8080"
echo ""
echo "For HTTPS (required for camera):"
echo "  python3 -m http.server 8080 --bind 127.0.0.1"
echo "  # Then access via: http://localhost:8080"
echo ""

# 7. Browser compatibility
print_status "7. Browser Compatibility:" "info"
echo "   ✅ Chrome 90+"
echo "   ✅ Firefox 88+"
echo "   ✅ Safari 14+"
echo "   ✅ Edge 90+"
echo "   ❌ Internet Explorer (not supported)"
echo ""

# 8. Mobile testing
print_status "8. Mobile Testing:" "info"
echo "   📱 QR scanner works best on mobile devices"
echo "   📱 Ensure camera permissions are granted"
echo "   📱 Test on both iOS and Android if possible"
echo ""

# 9. Production deployment
print_status "9. Production Deployment Tips:" "info"
echo "   🔒 Must use HTTPS for camera access"
echo "   🔒 Configure proper CORS settings"
echo "   🔒 Set up SSL certificate"
echo "   🔒 Enable gzip compression"
echo "   🔒 Set up database backups"
echo ""

# 10. Common issues and solutions
print_status "10. Common Issues & Solutions:" "info"
echo ""
echo "❌ Camera not working:"
echo "   → Ensure HTTPS connection"
echo "   → Check browser permissions"
echo "   → Try different browser"
echo ""
echo "❌ Database connection failed:"
echo "   → Verify Supabase credentials"
echo "   → Check internet connection"
echo "   → Ensure database tables are created"
echo ""
echo "❌ QR code not scanning:"
echo "   → Check if QR code expired"
echo "   → Ensure good lighting"
echo "   → Try moving camera closer/farther"
echo ""

print_status "System check complete!" "success"
print_status "Read QR_ATTENDANCE_SETUP_GUIDE.md for detailed instructions" "info"

# Ask if user wants to start a local server
echo ""
read -p "Would you like to start a local Python server? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Starting local server on port 8080..." "info"
    echo "Open http://localhost:8080 in your browser"
    echo "Press Ctrl+C to stop the server"
    echo ""
    
    if command -v python3 &> /dev/null; then
        python3 -m http.server 8080
    elif command -v python &> /dev/null; then
        python -m http.server 8080
    else
        print_status "Python not found. Please install Python or start server manually." "error"
    fi
fi
