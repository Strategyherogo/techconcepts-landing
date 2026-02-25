// ===========================================
// GA4 INITIALIZATION
// ===========================================
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-815E8YDZW8');

// ===========================================
// ANALYTICS & TRAFFIC SEGMENTATION
// ===========================================
const tcAnalytics = {
    sessionId: null,
    visitorId: null,
    source: null,
    medium: null,
    campaign: null,

    init() {
        // Generate or retrieve visitor ID
        this.visitorId = localStorage.getItem('tc_vid') || this.generateId();
        localStorage.setItem('tc_vid', this.visitorId);

        // Generate session ID
        this.sessionId = sessionStorage.getItem('tc_sid') || this.generateId();
        sessionStorage.setItem('tc_sid', this.sessionId);

        // Parse traffic source
        this.parseTrafficSource();

        // Track page view
        this.track('page_view', {
            page: window.location.pathname,
            referrer: document.referrer
        });

        // Track scroll depth
        this.trackScrollDepth();

        // Track time on page
        this.trackTimeOnPage();

        // Log traffic source for debugging
        console.log('TC Analytics:', {
            source: this.source,
            medium: this.medium,
            campaign: this.campaign,
            channel: this.getChannel()
        });
    },

    generateId() {
        return 'tc_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    },

    parseTrafficSource() {
        const params = new URLSearchParams(window.location.search);
        const referrer = document.referrer;

        // UTM parameters (highest priority)
        if (params.get('utm_source')) {
            this.source = params.get('utm_source');
            this.medium = params.get('utm_medium') || 'unknown';
            this.campaign = params.get('utm_campaign') || '';

            // Save first touch attribution
            if (!localStorage.getItem('tc_first_source')) {
                localStorage.setItem('tc_first_source', this.source);
                localStorage.setItem('tc_first_medium', this.medium);
                localStorage.setItem('tc_first_campaign', this.campaign);
            }
            return;
        }

        // Referrer-based detection
        if (referrer) {
            const ref = new URL(referrer);
            const host = ref.hostname.toLowerCase();

            // LinkedIn
            if (host.includes('linkedin.com') || host.includes('lnkd.in')) {
                this.source = 'linkedin';
                this.medium = 'social';
                return;
            }

            // Twitter/X
            if (host.includes('twitter.com') || host.includes('t.co') || host.includes('x.com')) {
                this.source = 'twitter';
                this.medium = 'social';
                return;
            }

            // Facebook
            if (host.includes('facebook.com') || host.includes('fb.com') || host.includes('fb.me')) {
                this.source = 'facebook';
                this.medium = 'social';
                return;
            }

            // Search engines (SEO)
            if (host.includes('google.') || host.includes('bing.com') || host.includes('duckduckgo.com') ||
                host.includes('yahoo.com') || host.includes('baidu.com') || host.includes('yandex.')) {
                this.source = host.split('.')[0].replace('www', 'google');
                this.medium = 'organic';
                return;
            }

            // AI assistants (AI discovery)
            if (host.includes('chat.openai.com') || host.includes('chatgpt.com') ||
                host.includes('claude.ai') || host.includes('perplexity.ai') ||
                host.includes('bard.google.com') || host.includes('copilot.microsoft.com')) {
                this.source = host.split('.')[0];
                this.medium = 'ai';
                return;
            }

            // Other referral
            this.source = host;
            this.medium = 'referral';
            return;
        }

        // Direct traffic
        this.source = 'direct';
        this.medium = 'none';
    },

    getChannel() {
        // Channel grouping for reporting
        const medium = this.medium?.toLowerCase();
        const source = this.source?.toLowerCase();

        if (medium === 'ai') return 'AI Discovery';
        if (medium === 'organic') return 'SEO / Organic Search';
        if (medium === 'social') {
            if (source === 'linkedin') return 'LinkedIn';
            if (source === 'twitter') return 'Twitter/X';
            return 'Social';
        }
        if (medium === 'paid' || medium === 'cpc' || medium === 'ppc') return 'Paid Ads';
        if (medium === 'email') return 'Email';
        if (medium === 'referral') return 'Referral';
        if (source === 'direct') return 'Direct';
        return 'Other';
    },

    track(event, data = {}) {
        const payload = {
            event,
            timestamp: new Date().toISOString(),
            visitor_id: this.visitorId,
            session_id: this.sessionId,
            source: this.source,
            medium: this.medium,
            campaign: this.campaign,
            channel: this.getChannel(),
            url: window.location.href,
            page_type: document.body.dataset.pageType || 'unknown',
            ...data
        };

        // Store events locally
        const events = JSON.parse(localStorage.getItem('tc_events') || '[]');
        events.push(payload);
        // Keep last 100 events
        if (events.length > 100) events.shift();
        localStorage.setItem('tc_events', JSON.stringify(events));

        // Send to GA4
        if (typeof gtag === 'function') {
            gtag('event', event, {
                event_category: data.category || 'engagement',
                event_label: data.label || data.section || data.text || '',
                traffic_source: this.source,
                traffic_medium: this.medium,
                traffic_channel: this.getChannel(),
                page_type: document.body.dataset.pageType || 'unknown',
                ...data
            });
        }

        console.log('TC Event:', payload);
    },

    trackScrollDepth() {
        let maxScroll = 0;
        const depths = [25, 50, 75, 100];
        const tracked = new Set();

        window.addEventListener('scroll', () => {
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = Math.round((window.scrollY / scrollHeight) * 100);

            depths.forEach(depth => {
                if (scrollPercent >= depth && !tracked.has(depth)) {
                    tracked.add(depth);
                    this.track('scroll_depth', { depth: depth + '%' });
                }
            });
        });
    },

    trackTimeOnPage() {
        let seconds = 0;
        const milestones = [30, 60, 120, 300];
        const tracked = new Set();

        setInterval(() => {
            seconds++;
            milestones.forEach(milestone => {
                if (seconds >= milestone && !tracked.has(milestone)) {
                    tracked.add(milestone);
                    this.track('time_on_page', { seconds: milestone });
                }
            });
        }, 1000);
    }
};

// ===========================================
// EVENT LISTENERS (wrapped in DOMContentLoaded)
// ===========================================
document.addEventListener('DOMContentLoaded', () => {
    // Initialize analytics
    tcAnalytics.init();

    // Track CTA clicks
    document.querySelectorAll('a.btn, a[href*="calendar.app.google"]').forEach(btn => {
        btn.addEventListener('click', () => {
            tcAnalytics.track('cta_click', {
                text: btn.textContent.trim(),
                href: btn.href,
                section: btn.closest('section')?.className || 'unknown'
            });
        });
    });

    // Track section views
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                tcAnalytics.track('section_view', {
                    section: entry.target.className || entry.target.id
                });
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });

    // Track external link clicks (LinkedIn, GitHub, fundops, mailswitch)
    document.querySelectorAll('a[href*="linkedin.com"], a[href*="github.com"], a[href*="fundops.io"], a[href*="mailswitch.io"]').forEach(link => {
        link.addEventListener('click', () => {
            const url = new URL(link.href);
            tcAnalytics.track('external_link_click', {
                category: 'outbound',
                destination: url.hostname,
                url: link.href,
                text: link.textContent.trim()
            });
        });
    });

    // Track contact intent (email/phone hover and click)
    document.querySelectorAll('a[href^="mailto:"], a[href^="tel:"]').forEach(link => {
        link.addEventListener('mouseenter', () => {
            tcAnalytics.track('contact_intent', {
                category: 'engagement',
                type: link.href.startsWith('mailto:') ? 'email' : 'phone',
                action: 'hover'
            });
        });
        link.addEventListener('click', () => {
            tcAnalytics.track('contact_intent', {
                category: 'conversion',
                type: link.href.startsWith('mailto:') ? 'email' : 'phone',
                action: 'click'
            });
        });
    });

    // Track time milestones (engaged visitors)
    (function() {
        let seconds = 0;
        const milestones = [30, 60, 120, 300]; // 30s, 1min, 2min, 5min
        const tracked = new Set();
        setInterval(() => {
            seconds++;
            milestones.forEach(m => {
                if (seconds >= m && !tracked.has(m)) {
                    tracked.add(m);
                    tcAnalytics.track('time_milestone', {
                        category: 'engagement',
                        seconds: m,
                        label: m < 60 ? m + 's' : Math.floor(m/60) + 'min'
                    });
                }
            });
        }, 1000);
    })();

    // Track exit intent (mouse leaves viewport)
    let exitIntentFired = false;
    document.addEventListener('mouseout', (e) => {
        if (!exitIntentFired && e.clientY < 10 && e.relatedTarget === null) {
            exitIntentFired = true;
            tcAnalytics.track('exit_intent', {
                category: 'engagement',
                time_on_page: Math.round(performance.now() / 1000),
                scroll_position: Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100)
            });
        }
    });

    // Track return visitors
    (function() {
        const visitCount = parseInt(localStorage.getItem('tc_visit_count') || '0') + 1;
        localStorage.setItem('tc_visit_count', visitCount);
        const lastVisit = localStorage.getItem('tc_last_visit');
        const now = new Date().toISOString();

        if (visitCount > 1) {
            tcAnalytics.track('return_visitor', {
                category: 'audience',
                visit_number: visitCount,
                days_since_last: lastVisit ? Math.floor((new Date(now) - new Date(lastVisit)) / (1000*60*60*24)) : 0
            });
        }
        localStorage.setItem('tc_last_visit', now);
    })();

    // Track copy to clipboard (email)
    document.addEventListener('copy', () => {
        const selection = window.getSelection().toString();
        if (selection.includes('@') && selection.includes('.')) {
            tcAnalytics.track('copy_email', {
                category: 'conversion',
                copied_text: selection.substring(0, 50)
            });
        }
    });

    // Track pricing section engagement (time spent viewing)
    const pricingSection = document.querySelector('.pricing, #pricing, section:has(.pricing-card)');
    if (pricingSection) {
        let pricingViewStart = null;
        const pricingObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    pricingViewStart = Date.now();
                    tcAnalytics.track('pricing_view', {
                        category: 'engagement',
                        action: 'enter'
                    });
                } else if (pricingViewStart) {
                    const duration = Math.round((Date.now() - pricingViewStart) / 1000);
                    tcAnalytics.track('pricing_view', {
                        category: 'engagement',
                        action: 'exit',
                        duration_seconds: duration
                    });
                    pricingViewStart = null;
                }
            });
        }, { threshold: 0.3 });
        pricingObserver.observe(pricingSection);
    }

    // Track FAQ accordion expands
    document.querySelectorAll('.faq-item, details, .accordion-item').forEach(faq => {
        faq.addEventListener('click', (e) => {
            const question = faq.querySelector('summary, .faq-question, h3, h4')?.textContent?.trim() || 'unknown';
            tcAnalytics.track('faq_expand', {
                category: 'engagement',
                question: question.substring(0, 100)
            });
        });
    });
});
