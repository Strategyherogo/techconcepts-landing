const { AnalyticsAdminServiceClient } = require('@google-analytics/admin');
const client = new AnalyticsAdminServiceClient();

async function listProperties() {
    const [accounts] = await client.listAccountSummaries();
    if (!accounts || accounts.length === 0) {
        console.log('No accounts found. Add service account email to GA4 Property Access.');
        return;
    }
    for (const account of accounts) {
        console.log('Account:', account.displayName, account.name);
        for (const prop of account.propertySummaries || []) {
            console.log('  Property:', prop.displayName, '→', prop.property);
        }
    }
}
listProperties().catch(e => console.log('Error:', e.message));
