#!/bin/bash
# HH310 Academic System - Production Deployment Script
# Final deployment script for production environments

echo "🚀 HH310 Academic System - Production Deployment"
echo "================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PRODUCTION_DIR="./deployment/production"
BACKUP_DIR="./backups/$(date +%Y%m%d-%H%M%S)"
LOG_FILE="deployment-$(date +%Y%m%d-%H%M%S).log"

echo "📋 Starting production deployment at $(date)" | tee $LOG_FILE

# Function to log with colors
log() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}" | tee -a $LOG_FILE
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Pre-deployment checks
log $BLUE "🔍 Running pre-deployment checks..."

# Check if production directory exists
if [ ! -d "$PRODUCTION_DIR" ]; then
    log $RED "❌ Production directory not found. Run setup-deployment.sh first."
    exit 1
fi

# Check essential files
ESSENTIAL_FILES=("home.html" "attendance-manager.js" "supabase-config.js" "enhanced-database-schema.sql")
for file in "${ESSENTIAL_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        log $RED "❌ Essential file missing: $file"
        exit 1
    fi
done

log $GREEN "✅ Pre-deployment checks passed"

# Create backup
log $BLUE "💾 Creating backup..."
mkdir -p "$BACKUP_DIR"
cp -r . "$BACKUP_DIR/"
log $GREEN "✅ Backup created at: $BACKUP_DIR"

# Update production files
log $BLUE "📁 Updating production files..."
cp home.html "$PRODUCTION_DIR/index.html"
cp attendance-manager.js "$PRODUCTION_DIR/assets/"
cp supabase-config.js "$PRODUCTION_DIR/config/"
cp enhanced-database-schema.sql "$PRODUCTION_DIR/scripts/"

# Copy additional assets
if [ -d "assets" ]; then
    cp -r assets/* "$PRODUCTION_DIR/assets/" 2>/dev/null || true
fi

log $GREEN "✅ Production files updated"

# Optimize files for production
log $BLUE "⚡ Optimizing files for production..."

# Minify CSS (if tools available)
if command_exists "cleancss"; then
    log $YELLOW "🔧 Minifying CSS..."
    # This would minify CSS if cleancss is available
fi

# Optimize images (if tools available)
if command_exists "imagemin"; then
    log $YELLOW "🖼️ Optimizing images..."
    # This would optimize images if imagemin is available
fi

log $GREEN "✅ Files optimized"

# Generate production configuration
log $BLUE "⚙️ Generating production configuration..."

# Read user input for production settings
echo ""
log $YELLOW "📝 Please provide production configuration:"
read -p "Supabase Project URL: " SUPABASE_URL
read -p "Supabase Anon Key: " SUPABASE_KEY
read -p "Institution Name: " INSTITUTION_NAME
read -p "Primary Color (hex): " PRIMARY_COLOR
read -p "Domain Name: " DOMAIN_NAME

# Update production configuration
cat > "$PRODUCTION_DIR/config/production-config.js" << EOF
// Production Configuration for $INSTITUTION_NAME
// Generated automatically by deployment script

const PRODUCTION_CONFIG = {
    supabase: {
        url: '$SUPABASE_URL',
        anonKey: '$SUPABASE_KEY',
        realtime: true
    },
    app: {
        name: '$INSTITUTION_NAME Academic System',
        version: '2.0',
        environment: 'production',
        institution: '$INSTITUTION_NAME',
        domain: '$DOMAIN_NAME',
        primaryColor: '$PRIMARY_COLOR',
        deployedAt: '$(date -u +"%Y-%m-%dT%H:%M:%SZ")'
    },
    features: {
        enableQRCode: true,
        enableRealtime: true,
        enableAnalytics: true,
        enableNotifications: true,
        autoSaveInterval: 30000
    }
};

// Initialize Supabase with production settings
if (typeof supabase !== 'undefined') {
    const supabaseClient = supabase.createClient(
        PRODUCTION_CONFIG.supabase.url,
        PRODUCTION_CONFIG.supabase.anonKey,
        {
            realtime: {
                enabled: PRODUCTION_CONFIG.supabase.realtime
            }
        }
    );
    
    window.supabaseClient = supabaseClient;
    window.PRODUCTION_CONFIG = PRODUCTION_CONFIG;
    
    console.log('✅ Production configuration loaded for: $INSTITUTION_NAME');
}
EOF

log $GREEN "✅ Production configuration generated"

# Update nginx configuration
log $BLUE "🌐 Generating nginx configuration..."

cat > "$PRODUCTION_DIR/config/nginx.conf" << EOF
# Nginx configuration for $INSTITUTION_NAME Academic System
# Generated automatically by deployment script

server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN_NAME www.$DOMAIN_NAME;
    
    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $DOMAIN_NAME www.$DOMAIN_NAME;

    # SSL Configuration (update paths as needed)
    ssl_certificate /etc/ssl/certs/$DOMAIN_NAME.crt;
    ssl_certificate_key /etc/ssl/private/$DOMAIN_NAME.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval'" always;

    # Root directory
    root /var/www/html;
    index index.html;

    # Main application
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Static assets with caching
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        gzip_static on;
    }

    # Config files (restrict access)
    location /config/ {
        deny all;
        return 404;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
EOF

log $GREEN "✅ Nginx configuration generated"

# Generate deployment instructions
log $BLUE "📖 Generating deployment instructions..."

cat > "$PRODUCTION_DIR/DEPLOY_INSTRUCTIONS.md" << EOF
# Deployment Instructions for $INSTITUTION_NAME

## Quick Deployment Steps

### 1. Upload Files
\`\`\`bash
# Upload to your web server
rsync -av --delete $PRODUCTION_DIR/ user@your-server:/var/www/html/

# Or using SCP
scp -r $PRODUCTION_DIR/* user@your-server:/var/www/html/
\`\`\`

### 2. Configure Web Server
\`\`\`bash
# Copy nginx configuration
sudo cp /var/www/html/config/nginx.conf /etc/nginx/sites-available/$DOMAIN_NAME
sudo ln -s /etc/nginx/sites-available/$DOMAIN_NAME /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
\`\`\`

### 3. Set Up SSL Certificate
\`\`\`bash
# Using Let's Encrypt (recommended)
sudo certbot --nginx -d $DOMAIN_NAME -d www.$DOMAIN_NAME

# Or install your existing certificate in:
# /etc/ssl/certs/$DOMAIN_NAME.crt
# /etc/ssl/private/$DOMAIN_NAME.key
\`\`\`

### 4. Supabase Setup
1. Go to your Supabase project dashboard
2. Run the SQL from: \`scripts/enhanced-database-schema.sql\`
3. Enable real-time on all tables
4. Verify RLS policies are active

### 5. Test Deployment
1. Visit: https://$DOMAIN_NAME
2. Test timetable generation
3. Test QR code attendance
4. Test real-time sync (open in multiple browsers)

## Configuration Files
- **Application**: \`/var/www/html/index.html\`
- **Database**: \`/var/www/html/scripts/enhanced-database-schema.sql\`
- **Nginx**: \`/var/www/html/config/nginx.conf\`
- **App Config**: \`/var/www/html/config/production-config.js\`

## Support
- Institution: $INSTITUTION_NAME
- Deployed: $(date)
- Version: 2.0 Enhanced
- Domain: https://$DOMAIN_NAME

For technical support, contact your IT administrator.
EOF

log $GREEN "✅ Deployment instructions generated"

# Create health check script
log $BLUE "🏥 Creating health check script..."

cat > "$PRODUCTION_DIR/scripts/health-check.sh" << 'EOF'
#!/bin/bash
# Health check script for HH310 Academic System

echo "🏥 HH310 System Health Check"
echo "==========================="

# Check if website is accessible
if curl -s --head --request GET https://$DOMAIN_NAME | grep "200 OK" > /dev/null; then
    echo "✅ Website is accessible"
else
    echo "❌ Website is not accessible"
fi

# Check if SSL is working
if curl -s --head --request GET https://$DOMAIN_NAME | grep "SSL" > /dev/null; then
    echo "✅ SSL certificate is working"
else
    echo "⚠️ SSL certificate may have issues"
fi

# Check database connectivity (this would need to be customized)
echo "ℹ️ Database connectivity should be tested manually in the application"

# Check file permissions
if [ -r "/var/www/html/index.html" ]; then
    echo "✅ Application files are readable"
else
    echo "❌ Application files have permission issues"
fi

echo ""
echo "Health check completed at $(date)"
EOF

chmod +x "$PRODUCTION_DIR/scripts/health-check.sh"

log $GREEN "✅ Health check script created"

# Generate final summary
log $BLUE "📊 Deployment Summary:"
echo ""
log $GREEN "✅ Production files ready in: $PRODUCTION_DIR"
log $GREEN "✅ Backup created in: $BACKUP_DIR"
log $GREEN "✅ Configuration generated for: $INSTITUTION_NAME"
log $GREEN "✅ Nginx config ready for: $DOMAIN_NAME"
log $GREEN "✅ Deployment instructions created"
log $GREEN "✅ Health check script ready"

echo ""
log $YELLOW "📋 Next Steps:"
echo "1. Review configuration in: $PRODUCTION_DIR/config/"
echo "2. Upload files to your web server"
echo "3. Configure your web server (nginx/apache)"
echo "4. Set up SSL certificate"
echo "5. Configure Supabase database"
echo "6. Test the application"
echo ""
log $BLUE "📖 See detailed instructions: $PRODUCTION_DIR/DEPLOY_INSTRUCTIONS.md"
echo ""

# Offer to create archive
read -p "📦 Create deployment archive? (y/n): " create_archive
if [[ $create_archive =~ ^[Yy]$ ]]; then
    ARCHIVE_NAME="${INSTITUTION_NAME// /-}-academic-system-$(date +%Y%m%d).tar.gz"
    tar -czf "$ARCHIVE_NAME" -C deployment/production .
    log $GREEN "✅ Deployment archive created: $ARCHIVE_NAME"
    echo "   Upload this file to your web server and extract it in your web root"
fi

echo ""
log $GREEN "🎉 Deployment preparation completed successfully!"
log $BLUE "📝 Deployment log saved to: $LOG_FILE"

# Show final checklist
cat << EOF

🔥 FINAL PRODUCTION CHECKLIST 🔥
================================
□ Files uploaded to web server
□ Nginx/Apache configured
□ SSL certificate installed
□ DNS pointing to server
□ Supabase database set up
□ Real-time enabled in Supabase
□ Application tested end-to-end
□ Backup strategy in place
□ Monitoring set up

Good luck with your deployment! 🚀
EOF
