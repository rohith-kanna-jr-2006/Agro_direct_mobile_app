import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import en from './locales/en/translation.json';
import hi from './locales/hi/translation.json';
import kn from './locales/kn/translation.json';
import ml from './locales/ml/translation.json';
import ta from './locales/ta/translation.json';
import te from './locales/te/translation.json';

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            ta: { translation: ta },
            ml: { translation: ml },
            te: { translation: te },
            hi: { translation: hi },
            kn: { translation: kn },
        },
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;
