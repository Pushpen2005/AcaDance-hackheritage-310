#!/bin/bash

# QR Attendance System - Quick Start Demo
# This script demonstrates how to test the QR attendance system

echo "🎯 QR Attendance System - Quick Start Demo"
echo "=========================================="

echo ""
echo "📋 System Components:"
echo "✅ index.html - Landing page"
echo "✅ login.html - Authentication"
echo "✅ home.html - Main dashboard"
echo "✅ qr-scanner.html - Student QR scanner"
echo "✅ qr-attendance-setup.sql - Database setup"
echo "✅ supabase-config.js - Backend configuration"

echo ""
echo "🚀 Quick Start Steps:"
echo ""
echo "1. 📁 Open your browser and navigate to: index.html"
echo "   This is your main landing page with system overview"

echo ""
echo "2. 🔧 Configure Supabase (Required):"
echo "   - Create account at https://supabase.com"
echo "   - Create new project"
echo "   - Copy your Project URL and API key"
echo "   - Update supabase-config.js with your credentials"

echo ""
echo "3. 🗄️ Set up Database:"
echo "   - Go to Supabase SQL Editor"
echo "   - Run the SQL from qr-attendance-setup.sql"
echo "   - This creates all tables and functions"

echo ""
echo "4. 👥 Create User Accounts:"
echo "   - Open login.html"
echo "   - Sign up as teacher (role: teacher)"
echo "   - Sign up as student (role: student)"

echo ""
echo "5. 🎓 For Teachers - Generate QR Code:"
echo "   - Login to home.html"
echo "   - Go to Attendance Tracking"
echo "   - Click 'Generate QR Code'"
echo "   - Display QR code for students"

echo ""
echo "6. 📱 For Students - Scan QR Code:"
echo "   - Open qr-scanner.html"
echo "   - Allow camera permissions"
echo "   - Scan the teacher's QR code"
echo "   - Attendance will be marked automatically"

echo ""
echo "🔧 Testing without Database:"
echo "If you want to test the UI without setting up Supabase:"
echo "- Open index.html directly in browser"
echo "- Navigate through the interfaces"
echo "- Note: QR scanning requires HTTPS for camera access"

echo ""
echo "📡 Local Server (Recommended):"
echo "For full functionality including camera access:"

if command -v python3 &> /dev/null; then
    echo "🐍 Python detected - Run: python3 -m http.server 8080"
fi

if command -v node &> /dev/null; then
    echo "📦 Node.js detected - Run: npx http-server"
fi

if command -v php &> /dev/null; then
    echo "🐘 PHP detected - Run: php -S localhost:8080"
fi

echo ""
echo "🌐 Then access: https://localhost:8080"

echo ""
echo "🔍 System Features:"
echo "📱 Mobile-optimized QR scanner"
echo "⚡ Real-time attendance tracking"
echo "📊 Analytics and reporting"
echo "👥 Multi-role user management"
echo "🗓️ Timetable management"
echo "🔐 Secure authentication"

echo ""
echo "🆘 Need Help?"
echo "📖 Read: QR_ATTENDANCE_SETUP_GUIDE.md"
echo "🔧 Check: Browser console for errors"
echo "🌐 Verify: Internet connection for Supabase"

echo ""
echo "🎉 Ready to start! Open index.html in your browser."
echo "=========================================="
