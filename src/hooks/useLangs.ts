import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo } from 'react'
import { mapLangsByKey } from '../conf'
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

    const finalNativeName = useMemo(
        () => mapLangsByKey.get(finalNativeKey || '') || 'Native',
        [finalNativeKey]
    )
    const finalTranslationName = useMemo(
        () => mapLangsByKey.get(finalTranslationKey || '') || 'Translation',
        [finalTranslationKey]
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
