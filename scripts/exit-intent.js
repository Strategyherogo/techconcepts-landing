// ===========================================
// EXIT-INTENT POPUP SYSTEM
// ===========================================
// Detects cursor leaving viewport and shows personalized offer
// based on current page type (data-page-type attribute on body)

(function() {
    'use strict';

    const EXIT_INTENT_KEY = 'tc_exit_intent_shown';
    const SESSION_KEY = 'tc_exit_session';

    // Check if already shown this session
    if (sessionStorage.getItem(SESSION_KEY)) {
        return;
    }

    // Page type to offer mapping
    const OFFERS = {
        'blog-post': {
            title: 'Get the Tool from This Article',
            description: 'Download the exact tool or template featured in this post. Used by 500+ builders.',
            cta: 'Get Free Tool',
            inputPlaceholder: 'your@email.com'
        },
        'service': {
            title: 'Free Service Assessment',
            description: 'Get a personalized 15-minute assessment of your specific needs. No pitch, just honest advice.',
            cta: 'Book Free Assessment',
            inputPlaceholder: 'your@email.com'
        },
        'product': {
            title: 'Get Early Access + 20% Off',
            description: 'Be first to try this product. Early access users get 20% off and direct support.',
            cta: 'Get Early Access',
            inputPlaceholder: 'your@email.com'
        },
        'tool': {
            title: 'Save Your Results',
            description: 'Get your calculation results via email plus a detailed breakdown and optimization tips.',
            cta: 'Send My Results',
            inputPlaceholder: 'your@email.com'
        },
        'default': {
            title: 'Join 500+ Builders',
            description: 'Get weekly insights on automation, AI, and shipping products fast. No fluff.',
            cta: 'Get Free Updates',
            inputPlaceholder: 'your@email.com'
        }
    };

    let triggered = false;
    let mouseOutCount = 0;

    // Get page type from body data attribute
    const pageType = document.body.dataset.pageType || 'default';
    const offer = OFFERS[pageType] || OFFERS['default'];

    // Create modal HTML
    function createModal() {
        const modal = document.createElement('div');
        modal.id = 'tc-exit-intent-modal';
        modal.innerHTML = `
            <div class="tc-exit-overlay"></div>
            <div class="tc-exit-modal">
                <button class="tc-exit-close" aria-label="Close">&times;</button>
                <div class="tc-exit-content">
                    <h2>${offer.title}</h2>
                    <p>${offer.description}</p>
                    <form class="tc-exit-form" action="https://formspree.io/f/xpwzgvqr" method="POST">
                        <input type="email" name="email" placeholder="${offer.inputPlaceholder}" required>
                        <input type="hidden" name="_subject" value="Exit Intent: ${pageType}">
                        <input type="hidden" name="page_type" value="${pageType}">
                        <input type="hidden" name="page_url" value="${window.location.href}">
                        <button type="submit" class="tc-exit-submit">${offer.cta}</button>
        <p style="font-size: 11px; margin-top: 8px; color: #666; text-align: center;">
          We respect your privacy. <a href="/privacy" style="color: var(--accent);">Privacy Policy</a>.
        </p>
      </form>
                </div>
            </div>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            #tc-exit-intent-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 9999;
                display: none;
                align-items: center;
                justify-content: center;
                animation: tc-fade-in 0.3s ease;
            }

            #tc-exit-intent-modal.active {
                display: flex;
            }

            .tc-exit-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(4px);
            }

            .tc-exit-modal {
                position: relative;
                background: #fff;
                border-radius: 16px;
                max-width: 480px;
                width: 90%;
                padding: 40px 32px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                animation: tc-slide-up 0.4s ease;
            }

            .tc-exit-close {
                position: absolute;
                top: 16px;
                right: 16px;
                background: transparent;
                border: none;
                font-size: 32px;
                line-height: 1;
                color: #999;
                cursor: pointer;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 4px;
                transition: all 0.2s;
            }

            .tc-exit-close:hover {
                background: #f3f4f6;
                color: #333;
            }

            .tc-exit-content h2 {
                font-size: 28px;
                font-weight: 700;
                color: #000;
                margin-bottom: 12px;
                line-height: 1.2;
            }

            .tc-exit-content p {
                font-size: 16px;
                color: #6b7280;
                line-height: 1.6;
                margin-bottom: 28px;
            }

            .tc-exit-form {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .tc-exit-form input[type="email"] {
                padding: 14px 16px;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                font-size: 15px;
                transition: border-color 0.2s;
            }

            .tc-exit-form input[type="email"]:focus {
                outline: none;
                border-color: #2563eb;
            }

            .tc-exit-submit {
                background: #000;
                color: #fff;
                border: none;
                padding: 14px 24px;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: background 0.2s;
            }

            .tc-exit-submit:hover {
                background: #333;
            }

            @keyframes tc-fade-in {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            @keyframes tc-slide-up {
                from {
                    transform: translateY(40px);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }

            @media (max-width: 600px) {
                .tc-exit-modal {
                    padding: 32px 24px;
                }

                .tc-exit-content h2 {
                    font-size: 24px;
                }
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(modal);

        return modal;
    }

    // Show modal
    function showModal() {
        if (triggered) return;
        triggered = true;

        const modal = createModal();

        // Track event
        if (typeof tcAnalytics !== 'undefined') {
            tcAnalytics.track('exit_intent_shown', {
                category: 'conversion',
                page_type: pageType,
                offer_type: pageType
            });
        }

        if (typeof gtag === 'function') {
            gtag('event', 'exit_intent_shown', {
                event_category: 'conversion',
                page_type: pageType
            });
        }

        // Show modal
        setTimeout(() => {
            modal.classList.add('active');
        }, 100);

        // Mark as shown this session
        sessionStorage.setItem(SESSION_KEY, 'true');

        // Close handlers
        const closeBtn = modal.querySelector('.tc-exit-close');
        const overlay = modal.querySelector('.tc-exit-overlay');

        function closeModal() {
            modal.classList.remove('active');

            if (typeof tcAnalytics !== 'undefined') {
                tcAnalytics.track('exit_intent_dismissed', {
                    category: 'conversion',
                    page_type: pageType
                });
            }

            if (typeof gtag === 'function') {
                gtag('event', 'exit_intent_dismissed', {
                    event_category: 'conversion',
                    page_type: pageType
                });
            }

            setTimeout(() => {
                modal.remove();
            }, 300);
        }

        closeBtn.addEventListener('click', closeModal);
        overlay.addEventListener('click', closeModal);

        // ESC key
        document.addEventListener('keydown', function escHandler(e) {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', escHandler);
            }
        });

        // Form submission tracking
        const form = modal.querySelector('.tc-exit-form');
        form.addEventListener('submit', () => {
            if (typeof tcAnalytics !== 'undefined') {
                tcAnalytics.track('exit_intent_converted', {
                    category: 'conversion',
                    page_type: pageType,
                    offer_type: pageType
                });
            }

            if (typeof gtag === 'function') {
                gtag('event', 'exit_intent_converted', {
                    event_category: 'conversion',
                    page_type: pageType,
                    value: 1
                });
            }

            // Show success message
            setTimeout(() => {
                form.innerHTML = '<p style="text-align: center; color: #10b981; font-weight: 600;">Thanks! Check your inbox.</p>';
                setTimeout(closeModal, 2000);
            }, 100);
        });
    }

    // Exit intent detection
    function detectExitIntent(e) {
        // Mouse leaves viewport from top
        if (e.clientY < 20 && e.relatedTarget === null && !triggered) {
            mouseOutCount++;

            // Require 2 exit attempts to reduce false positives
            if (mouseOutCount >= 2) {
                showModal();
            }
        }
    }

    // Wait for page to load and user to engage before enabling
    window.addEventListener('load', () => {
        // Delay activation by 5 seconds to ensure user is engaged
        setTimeout(() => {
            document.addEventListener('mouseout', detectExitIntent);
        }, 5000);
    });

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        document.removeEventListener('mouseout', detectExitIntent);
    });

})();
