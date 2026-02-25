# Google Search Console Setup Guide

## Quick Setup (5 minutes)

### Step 1: Add Property
1. Go to: https://search.google.com/search-console
2. Click "Add Property"
3. Choose "URL prefix" (not Domain)
4. Enter: `https://techconcepts.org`

### Step 2: Verify Ownership
**Method 1: HTML File Upload (Recommended)**
- Download verification file from GSC
- Upload to site root: `techconcepts.org/google[code].html`
- Click "Verify"

**Method 2: Meta Tag**
- Copy meta tag from GSC: `<meta name="google-site-verification" content="[code]">`
- Add to `<head>` section of `index.html`
- Deploy
- Click "Verify"

**Method 3: DNS (if you manage DNS)**
- Add TXT record to techconcepts.org DNS
- Value: `google-site-verification=[code]`
- Click "Verify"

### Step 3: Submit Sitemap
1. In GSC, go to "Sitemaps" (left sidebar)
2. Enter: `https://techconcepts.org/sitemap.xml`
3. Click "Submit"
4. Status should show "Success" within minutes

### Step 4: Initial Configuration
- **URL Inspection:** Test 5 key pages (homepage, products, services, blog, tools)
- **Coverage Report:** Check for crawl errors
- **Mobile Usability:** Verify no mobile issues
- **Core Web Vitals:** Check performance metrics

## What to Monitor (Weekly)

### Performance Tab
- **Total clicks** — trending up?
- **Total impressions** — which keywords showing?
- **Average CTR** — target >3% for branded, >1% for generic
- **Average position** — track ranking changes

### Coverage Tab
- **Valid pages** — should match sitemap count (40 URLs)
- **Excluded pages** — check why (noindex, redirect, etc.)
- **Errors** — fix immediately

### Enhancements
- **Mobile Usability** — 0 errors expected
- **Core Web Vitals** — aim for all green
- **Breadcrumbs** — verify structured data detected

## Current Sitemap Status
- **URL count:** 40
- **Last modified:** 2026-02-25
- **Included pages:**
  - Homepage (1)
  - Services (6 + hub)
  - Case Studies (3 + hub)
  - Blog (3 + hub)
  - Products (9 + hub)
  - Tools (hub)
  - About, Privacy, Terms
  - Legacy /ops/ paths
  - Product detail pages (Claude Battery, Bulk Issue Rewriter, Email Exporter, etc.)

## Expected Timeline
- **Verification:** Immediate
- **Sitemap processing:** 1-24 hours
- **First indexing:** 24-48 hours
- **Full site indexed:** 3-7 days
- **Ranking data:** 7-14 days

## Next Steps After Setup
1. Request indexing for top 10 priority pages
2. Set up email alerts for critical issues
3. Monitor for manual actions (none expected)
4. Track keyword performance weekly
5. Submit new blog posts for indexing immediately after publishing

## Contact
Once verified, share GSC property access with: eg@techconcepts.org (optional for monitoring)
