// ===========================================
// TRANSLATIONS
// ===========================================
const translations = {
    en: {
        'nav.pricing': 'Services',
        'nav.process': 'How it works',
        'nav.about': 'About',
        'nav.resources': 'Resources',
        'nav.blog': 'Blog',
        'nav.faq': 'FAQ',
        'nav.cta': 'Get Started',
        'hero.title': 'I Build Products.<br>You Own Them.',
        'hero.subtitle': 'I build products for non-technical founders. Full ownership, delivered in 1-8 weeks.',
        'hero.cta1': 'Book a Call',
        'hero.cta2': 'How It Works'
    },
    es: {
        'nav.pricing': 'Servicios',
        'nav.process': 'Cómo funciona',
        'nav.about': 'Sobre mí',
        'nav.resources': 'Recursos',
        'nav.blog': 'Blog',
        'nav.faq': 'FAQ',
        'nav.cta': 'Empezar',
        'hero.title': 'Construyo Productos.<br>Tú los Posees.',
        'hero.subtitle': 'Construyo productos para fundadores no técnicos. Propiedad total, entrega en 1-8 semanas.',
        'hero.cta1': 'Reservar Llamada',
        'hero.cta2': 'Cómo Funciona'
    },
    fr: {
        'nav.pricing': 'Services',
        'nav.process': 'Comment ça marche',
        'nav.about': 'À propos',
        'nav.resources': 'Ressources',
        'nav.blog': 'Blog',
        'nav.faq': 'FAQ',
        'nav.cta': 'Commencer',
        'hero.title': 'Je Construis des Produits.<br>Vous les Possédez.',
        'hero.subtitle': 'Je construis des produits pour les fondateurs non-techniques. Propriété totale, livré en 1-8 semaines.',
        'hero.cta1': 'Réserver un Appel',
        'hero.cta2': 'Comment ça Marche'
    },
    de: {
        'nav.pricing': 'Leistungen',
        'nav.process': 'So funktioniert es',
        'nav.about': 'Über mich',
        'nav.resources': 'Ressourcen',
        'nav.blog': 'Blog',
        'nav.faq': 'FAQ',
        'nav.cta': 'Loslegen',
        'hero.title': 'Ich Baue Produkte.<br>Sie Gehören Ihnen.',
        'hero.subtitle': 'Ich baue Produkte für nicht-technische Gründer. Volle Eigentumsrechte, Lieferung in 1-8 Wochen.',
        'hero.cta1': 'Gespräch Buchen',
        'hero.cta2': 'So Funktioniert Es'
    },
    it: {
        'nav.pricing': 'Servizi',
        'nav.process': 'Come funziona',
        'nav.about': 'Chi sono',
        'nav.resources': 'Risorse',
        'nav.blog': 'Blog',
        'nav.faq': 'FAQ',
        'nav.cta': 'Inizia',
        'hero.title': 'Costruisco Prodotti.<br>Tu li Possiedi.',
        'hero.subtitle': 'Costruisco prodotti per fondatori non tecnici. Proprietà totale, consegnato in 1-8 settimane.',
        'hero.cta1': 'Prenota una Chiamata',
        'hero.cta2': 'Come Funziona'
    }
};

const langNames = { en: 'EN', es: 'ES', fr: 'FR', de: 'DE', it: 'IT' };

function setLanguage(lang) {
    if (!translations[lang]) return;

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) {
            el.innerHTML = translations[lang][key];
        }
    });

    document.getElementById('currentLang').textContent = langNames[lang];
    document.getElementById('langDropdown').classList.remove('active');
    localStorage.setItem('tc_lang', lang);

    // Track language change
    if (typeof tcAnalytics !== 'undefined') {
        tcAnalytics.track('language_change', { language: lang });
    }
}

// Country to language mapping
const countryToLang = {
    ES: 'es', MX: 'es', AR: 'es', CO: 'es', CL: 'es', PE: 'es',
    FR: 'fr', BE: 'fr', CH: 'fr', CA: 'fr',
    DE: 'de', AT: 'de',
    IT: 'it',
    GB: 'en', US: 'en', AU: 'en', NZ: 'en', IE: 'en'
};

async function detectLanguage() {
    // Check saved preference
    const saved = localStorage.getItem('tc_lang');
    if (saved && translations[saved]) {
        setLanguage(saved);
        return;
    }

    // Try Cloudflare country header (via fetch to self)
    try {
        const resp = await fetch(window.location.href, { method: 'HEAD' });
        const country = resp.headers.get('cf-ipcountry');
        if (country && countryToLang[country]) {
            setLanguage(countryToLang[country]);
            return;
        }
    } catch (e) {}

    // Fallback to browser language
    const browserLang = navigator.language?.split('-')[0];
    if (translations[browserLang]) {
        setLanguage(browserLang);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    detectLanguage();
});
