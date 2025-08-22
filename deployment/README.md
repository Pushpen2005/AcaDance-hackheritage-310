# HH310 Academic System - Deployment Guide

## Quick Deployment Steps

### 1. Production Deployment
```bash
# 1. Update production configuration
nano deployment/production/config/production-config.js

# 2. Upload to your web server
rsync -av deployment/production/ user@yourserver:/var/www/html/

# 3. Configure web server (nginx example)
sudo nginx -t && sudo systemctl reload nginx
```

### 2. Supabase Setup
1. Create new Supabase project
2. Run `deployment/production/scripts/enhanced-database-schema.sql`
3. Enable real-time on all tables
4. Update `production-config.js` with your credentials

### 3. Testing
```bash
# Local testing
python3 -m http.server 8000
open http://localhost:8000/deployment/production/

# Or using Node.js
npx serve deployment/production/
```

### 4. Security Checklist
- [ ] HTTPS enabled
- [ ] Supabase RLS policies active
- [ ] Environment variables secured
- [ ] CORS properly configured
- [ ] API keys not exposed in client code

## Environment Configurations

- **Production**: `deployment/production/`
- **Staging**: `deployment/staging/`
- **Local**: Use root directory for development
