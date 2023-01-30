import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo } from 'react'
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

    const finalNativeName = useMemo(
        () => voices.get(finalNativeKey || '')?.name || 'Native',
        [finalNativeKey, voices]
    )
    const finalTranslationName = useMemo(
        () => voices.get(finalTranslationKey || '')?.name || 'Translation',
        [finalTranslationKey, voices]
    )

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
