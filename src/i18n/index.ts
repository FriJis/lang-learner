import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { i18nEn } from './langs/en'

i18n.use(initReactI18next) // passes i18n down to react-i18next
    .init({
        resources: {
            en: {
                translation: i18nEn,
            },
        },
        lng: 'en',
        fallbackLng: 'en',
    })
