#!/usr/bin/env node
/**
 * GA4 CLI Query Tool for techconcepts.org
 *
 * Setup:
 * 1. Go to console.cloud.google.com
 * 2. Create/select project → Enable "Google Analytics Data API"
 * 3. IAM → Service Accounts → Create → Download JSON key
 * 4. GA4 Admin → Property Access → Add service account email
 * 5. Set env: export GOOGLE_APPLICATION_CREDENTIALS="path/to/key.json"
 */

const { BetaAnalyticsDataClient } = require('@google-analytics/data');

const PROPERTY_ID = process.env.GA4_PROPERTY_ID || '470aborrar815E8YDZW8'.replace(/[^0-9]/g, '');

async function runReport(days = 7) {
    const client = new BetaAnalyticsDataClient();

    console.log(`\n📊 GA4 Report - Last ${days} days\n${'='.repeat(40)}\n`);

    // Basic metrics
    const [response] = await client.runReport({
        property: `properties/${PROPERTY_ID}`,
        dateRanges: [{ startDate: `${days}daysAgo`, endDate: 'today' }],
        dimensions: [{ name: 'date' }],
        metrics: [
            { name: 'activeUsers' },
            { name: 'sessions' },
            { name: 'screenPageViews' },
            { name: 'averageSessionDuration' }
        ],
        orderBys: [{ dimension: { orderType: 'ALPHANUMERIC', dimensionName: 'date' } }]
    });

    console.log('📅 Daily Traffic:');
    response.rows?.forEach(row => {
        const date = row.dimensionValues[0].value;
        const users = row.metricValues[0].value;
        const sessions = row.metricValues[1].value;
        const views = row.metricValues[2].value;
        console.log(`  ${date}: ${users} users, ${sessions} sessions, ${views} views`);
    });

    // Traffic sources
    const [sourcesResp] = await client.runReport({
        property: `properties/${PROPERTY_ID}`,
        dateRanges: [{ startDate: `${days}daysAgo`, endDate: 'today' }],
        dimensions: [{ name: 'sessionSource' }, { name: 'sessionMedium' }],
        metrics: [{ name: 'sessions' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 10
    });

    console.log('\n🔗 Traffic Sources:');
    sourcesResp.rows?.forEach(row => {
        const source = row.dimensionValues[0].value || '(direct)';
        const medium = row.dimensionValues[1].value || '(none)';
        const sessions = row.metricValues[0].value;
        console.log(`  ${source} / ${medium}: ${sessions} sessions`);
    });

    // Events
    const [eventsResp] = await client.runReport({
        property: `properties/${PROPERTY_ID}`,
        dateRanges: [{ startDate: `${days}daysAgo`, endDate: 'today' }],
        dimensions: [{ name: 'eventName' }],
        metrics: [{ name: 'eventCount' }],
        orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
        limit: 15
    });

    console.log('\n⚡ Events:');
    eventsResp.rows?.forEach(row => {
        const event = row.dimensionValues[0].value;
        const count = row.metricValues[0].value;
        console.log(`  ${event}: ${count}`);
    });

    // Pages
    const [pagesResp] = await client.runReport({
        property: `properties/${PROPERTY_ID}`,
        dateRanges: [{ startDate: `${days}daysAgo`, endDate: 'today' }],
        dimensions: [{ name: 'pagePath' }],
        metrics: [{ name: 'screenPageViews' }],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: 10
    });

    console.log('\n📄 Top Pages:');
    pagesResp.rows?.forEach(row => {
        const page = row.dimensionValues[0].value;
        const views = row.metricValues[0].value;
        console.log(`  ${page}: ${views} views`);
    });

    console.log('\n');
}

// Realtime report
async function runRealtime() {
    const client = new BetaAnalyticsDataClient();

    console.log('\n🔴 GA4 Realtime\n' + '='.repeat(40) + '\n');

    const [response] = await client.runRealtimeReport({
        property: `properties/${PROPERTY_ID}`,
        dimensions: [{ name: 'country' }],
        metrics: [{ name: 'activeUsers' }]
    });

    let total = 0;
    console.log('👥 Active Users by Country:');
    response.rows?.forEach(row => {
        const country = row.dimensionValues[0].value;
        const users = parseInt(row.metricValues[0].value);
        total += users;
        console.log(`  ${country}: ${users}`);
    });
    console.log(`\n  Total: ${total} active users\n`);
}

// CLI
const args = process.argv.slice(2);
const command = args[0] || 'report';
const days = parseInt(args[1]) || 7;

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.log(`
⚠️  Setup required:

1. Go to: https://console.cloud.google.com/apis/library/analyticsdata.googleapis.com
2. Enable "Google Analytics Data API"
3. Create Service Account: https://console.cloud.google.com/iam-admin/serviceaccounts
4. Download JSON key
5. Run: export GOOGLE_APPLICATION_CREDENTIALS="/path/to/key.json"
6. Run: export GA4_PROPERTY_ID="your-property-id"
7. Add service account email to GA4 property access

Then run: node ga4-query.js [report|realtime] [days]
`);
    process.exit(1);
}

if (command === 'realtime') {
    runRealtime().catch(console.error);
} else {
    runReport(days).catch(console.error);
}
