class LanguageManager {
    constructor() {
        this.currentLang = localStorage.getItem('ocsn-language') || 'en';
        this.translations = {};
        this.supportedLanguages = [
            { code: 'en', name: 'English', flag: '🇺🇸' },
            { code: 'es', name: 'Español', flag: '🇪🇸' },
            { code: 'fr', name: 'Français', flag: '🇫🇷' },
            { code: 'ru', name: 'Русский', flag: '🇷🇺' },
            { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
            { code: 'tl', name: 'Tagalog', flag: '🇵🇭' },
            { code: 'ja', name: '日本語', flag: '🇯🇵' },
            { code: 'ko', name: '한국어', flag: '🇰🇷' },
            { code: 'zh-CN', name: '简体中文', flag: '🇨🇳' },
            { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
            { code: 'pt', name: 'Português', flag: '🇧🇷' },
            { code: 'ar', name: 'العربية', flag: '🇸🇦' }
        ];
    }
    async init() {
        const urlParams = new URLSearchParams(window.location.search);
        const urlLang = urlParams.get('lang');
        if (urlLang && this.supportedLanguages.find(l => l.code === urlLang)) {
            this.currentLang = urlLang;
            localStorage.setItem('ocsn-language', urlLang);
        }
        await this.loadLanguage(this.currentLang);
        this.applyTranslations();
        this.setupLanguageSwitcher();
        this.applyDirectionality();
    }
    async loadLanguage(langCode) {
        try {
            const response = await fetch(`lang/${langCode}.json`);
            if (!response.ok) {
                if (langCode !== 'en') {
                    console.warn(`Language ${langCode} not found, falling back to English`);
                    return await this.loadLanguage('en');
                }
                throw new Error('English language file not found');
            }
            this.translations = await response.json();
            this.currentLang = langCode;
        } catch (error) {
            console.error('Error loading language:', error);
            try {
                const altResponse = await fetch(`./lang/${langCode}.json`);
                if (altResponse.ok) {
                    this.translations = await altResponse.json();
                    this.currentLang = langCode;
                }
            } catch (altError) {
                console.error('Alternative path also failed:', altError);
            }
        }
    }
    applyTranslations() {
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.getAttribute('data-translate');
            const translation = this.getTranslation(key);
            if (translation) {
                const icons = element.querySelectorAll('i[data-lucide]');
                if (icons.length > 0) {
                    const iconHTML = Array.from(icons).map(icon => icon.outerHTML).join('');
                    element.innerHTML = iconHTML + ' ' + translation;
                } else {
                    element.textContent = translation;
                }
            }
        });
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.placeholder = this.getTranslation('nav.searchPlaceholder') || 'Search guidelines';
        }
        const langBtn = document.querySelector('.language-btn span');
        if (langBtn) {
            const currentLangData = this.supportedLanguages.find(l => l.code === this.currentLang);
            if (currentLangData) {
                langBtn.textContent = currentLangData.name;
            }
        }
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    getTranslation(key) {
        const keys = key.split('.');
        let value = this.translations;
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return null;
            }
        }
        return value;
    }
    setupLanguageSwitcher() {
        const langBtn = document.querySelector('.language-btn');
        if (!langBtn) return;
        const newLangBtn = langBtn.cloneNode(true);
        langBtn.parentNode.replaceChild(newLangBtn, langBtn);
        let dropdown = document.querySelector('.language-dropdown');
        if (!dropdown) {
            dropdown = document.createElement('div');
            dropdown.className = 'language-dropdown';
            dropdown.innerHTML = this.supportedLanguages.map(lang => `
                <div class="language-option" data-lang="${lang.code}">
                    <span class="lang-flag">${lang.flag}</span>
                    <span class="lang-name">${lang.name}</span>
                    ${lang.code === this.currentLang ? '<i data-lucide="check" class="lang-check"></i>' : ''}
                </div>
            `).join('');
            newLangBtn.style.position = 'relative';
            newLangBtn.appendChild(dropdown);
        }
        newLangBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('show');
            lucide.createIcons();
        });
        dropdown.querySelectorAll('.language-option').forEach(option => {
            option.addEventListener('click', async (e) => {
                e.stopPropagation();
                const langCode = option.getAttribute('data-lang');
                if (langCode !== this.currentLang) {
                    await this.switchLanguage(langCode);
                }
                dropdown.classList.remove('show');
            });
        });
        document.addEventListener('click', () => {
            dropdown.classList.remove('show');
        });
    }
    async switchLanguage(langCode) {
        localStorage.setItem('ocsn-language', langCode);
        const url = new URL(window.location);
        url.searchParams.set('lang', langCode);
        window.history.replaceState({}, '', url);
        await this.loadLanguage(langCode);
        this.applyTranslations();
        this.applyDirectionality();
        this.setupLanguageSwitcher();
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: langCode } }));
    }
    applyDirectionality() {
        const dir = this.translations.dir || 'ltr';
        document.documentElement.setAttribute('dir', dir);
        document.body.classList.toggle('rtl', dir === 'rtl');
    }
    translateSearchTerms(query) {
        const searchMappings = {
            'en': {
                'selfharm': ['self-harm', 'self harm'],
                'ai': ['artificial intelligence'],
                'tos': ['terms of service']
            },
            'es': {
                'autolesión': ['self-harm', 'selfharm'],
                'ia': ['inteligencia artificial'],
                'términos': ['terms of service', 'tos']
            },
            'fr': {
                'automutilation': ['self-harm', 'selfharm'],
                'ia': ['intelligence artificielle'],
                'cgu': ['conditions générales', 'terms of service']
            },
            'ru': {
                'селфхарм': ['self-harm', 'selfharm'],
                'ии': ['искусственный интеллект'],
                'условия': ['terms of service', 'tos']
            }
        };
        const langMappings = searchMappings[this.currentLang] || searchMappings['en'];
        const variations = [query];
        Object.entries(langMappings).forEach(([term, alternatives]) => {
            if (query.toLowerCase() === term.toLowerCase()) {
                variations.push(...alternatives);
            }
            alternatives.forEach(alt => {
                if (query.toLowerCase() === alt.toLowerCase()) {
                    variations.push(term);
                }
            });
        });
        return [...new Set(variations)];
    }
}
if (!window.languageManager) {
    window.languageManager = new LanguageManager();
}
let languageInitialized = false;
document.addEventListener('DOMContentLoaded', async () => {
    if (!languageInitialized) {
        languageInitialized = true;
        await window.languageManager.init();
    }
});