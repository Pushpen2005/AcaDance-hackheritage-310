// Staging Configuration for HH310 Academic System
// For testing before production deployment

const STAGING_CONFIG = {
    supabase: {
        url: 'YOUR_STAGING_SUPABASE_URL',
        anonKey: 'YOUR_STAGING_SUPABASE_ANON_KEY',
        realtime: true
    },
    app: {
        name: 'HH310 Academic System (Staging)',
        version: '2.0-staging',
        environment: 'staging',
        institution: 'Test Institution',
        logo: 'assets/logo.png',
        primaryColor: '#1f2937',
        secondaryColor: '#f59e0b' // Different color for staging
    },
    features: {
        enableQRCode: true,
        enableRealtime: true,
        enableAnalytics: true,
        enableNotifications: true,
        autoSaveInterval: 10000 // Faster for testing
    }
};

const supabaseClient = supabase.createClient(
    STAGING_CONFIG.supabase.url,
    STAGING_CONFIG.supabase.anonKey
);

window.supabaseClient = supabaseClient;
window.STAGING_CONFIG = STAGING_CONFIG;
