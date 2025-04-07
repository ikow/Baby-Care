// Only create i18n if it doesn't exist
if (typeof window.i18n === 'undefined') {
    window.i18n = {
        currentLanguage: 'en',

        init() {
            this.currentLanguage = localStorage.getItem('language') || 'en';
            this.updatePageContent();
        },

        t(key) {
            return translations[this.currentLanguage]?.[key] || key;
        },

        updatePageContent() {
            document.querySelectorAll('[data-i18n]').forEach(element => {
                const key = element.getAttribute('data-i18n');
                element.textContent = this.t(key);
            });
        },

        setLanguage(lang) {
            if (translations[lang]) {
                this.currentLanguage = lang;
                localStorage.setItem('language', lang);
                this.updatePageContent();
            }
        }
    };
} 