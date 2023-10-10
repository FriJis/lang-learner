import { useAppContext } from '../ctx/app'

export function useLangs(reverse?: boolean) {
    const { nativeLang, translationLang } = useAppContext()

    return {
        nativeLang: reverse ? translationLang : nativeLang,
        translationLang: reverse ? nativeLang : translationLang,
    }
}
