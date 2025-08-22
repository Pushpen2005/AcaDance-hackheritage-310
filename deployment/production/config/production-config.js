// Production Configuration for HH310 Academic System
// Update these values with your production Supabase credentials

const PRODUCTION_CONFIG = {
    supabase: {
        url: 'YOUR_SUPABASE_URL_HERE',
        anonKey: 'YOUR_SUPABASE_ANON_KEY_HERE',
        realtime: true
    },
    app: {
        name: 'HH310 Academic System',
        version: '2.0',
        environment: 'production',
        institution: 'Your Institution Name',
        logo: 'assets/logo.png',
        primaryColor: '#1f2937',
        secondaryColor: '#3b82f6'
    },
    features: {
        enableQRCode: true,
        enableRealtime: true,
        enableAnalytics: true,
        enableNotifications: true,
        autoSaveInterval: 30000 // 30 seconds
    }
};

// Initialize Supabase with production settings
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
