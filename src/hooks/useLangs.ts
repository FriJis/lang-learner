import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo } from 'react'
import { mapLangsByKey } from '../conf'
import { getLangByVoiceURI } from '../utils'
import { getCollection } from '../utils/db'

export function useLangs(reverse?: boolean) {
    const collection = useLiveQuery(() => getCollection())

    const nativeKey = useMemo(() => collection?.nativeLang, [collection])
    const translationKey = useMemo(
        () => collection?.translationLang,
        [collection]
    )

    const finalNativeKey = useMemo(
        () => (reverse ? translationKey : nativeKey),
        [reverse, translationKey, nativeKey]
    )

    const finalTranslationKey = useMemo(
        () => (!reverse ? translationKey : nativeKey),
        [reverse, translationKey, nativeKey]
    )

    const voices = useMemo(
        () =>
            new Map(
                window.speechSynthesis
                    .getVoices()
                    .map((voice) => [voice.voiceURI, voice])
            ),
        []
    )

    const finalNativeName = useMemo(() => {
        const name = voices.get(finalNativeKey || '')?.name
        if (!name) return 'Native'
        const shortLang = getLangByVoiceURI(name)
        if (!shortLang) return 'Native'
        return mapLangsByKey.get(shortLang) || 'Native'
    }, [finalNativeKey, voices])
    const finalTranslationName = useMemo(() => {
        const name = voices.get(finalTranslationKey || '')?.name
        if (!name) return 'Translation'
        const shortLang = getLangByVoiceURI(name)
        if (!shortLang) return 'Translation'
        return mapLangsByKey.get(shortLang) || 'Translation'
    }, [finalTranslationKey, voices])

    return {
        native: {
            key: finalNativeKey,
            name: finalNativeName,
        },
        translation: {
            key: finalTranslationKey,
            name: finalTranslationName,
        },
    }
}
