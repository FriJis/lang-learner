import {
    FC,
    PropsWithChildren,
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react'
import { Word } from '../types/word'
import { useLiveQuery } from 'dexie-react-hooks'
import { getCollection, getStatistics, getWords } from '../utils/db'
import { Collection } from '../types/collection'
import { Statistics } from '../types/statistics'
import { AppLang } from '../types/app'
import { languagesConfig } from '../conf'

export const AppContext = createContext<{
    words: Word[]
    collection?: Collection
    statistics: Statistics[]
    nativeLang?: AppLang
    translationLang?: AppLang
    voices: SpeechSynthesisVoice[]
}>({ words: [], statistics: [], voices: [] })

export const useAppContext = () => useContext(AppContext)

export const AppContextProvider: FC<PropsWithChildren> = ({ children }) => {
    const words = useLiveQuery(() => getWords())
    const collection = useLiveQuery(() => getCollection())
    const statistics = useLiveQuery(() => getStatistics())
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])

    const nativeKey = useMemo(() => {
        const voiceURI = collection?.nativeLang
        if (!voiceURI) return

        const voice = voices.find((voice) => voice.voiceURI === voiceURI)
        if (!voice) return

        return voice.lang.split('-')[0]
    }, [collection, voices])

    const translationKey = useMemo(() => {
        const voiceURI = collection?.translationLang
        if (!voiceURI) return

        const voice = voices.find((voice) => voice.voiceURI === voiceURI)
        if (!voice) return

        return voice.lang.split('-')[0]
    }, [collection, voices])

    const nativeName = useMemo(() => {
        const defName = 'Native'

        const voiceURI = collection?.nativeLang
        if (!voiceURI) return defName

        if (!nativeKey) return voiceURI

        const conf = languagesConfig.find(([key]) =>
            new RegExp(nativeKey, 'gim').test(key)
        )

        if (!conf) return voiceURI

        const [, name] = conf
        return name
    }, [collection, nativeKey])

    const translationName = useMemo(() => {
        const defName = 'Translation'

        const voiceURI = collection?.translationLang
        if (!voiceURI) return defName

        if (!translationKey) return voiceURI

        const conf = languagesConfig.find(([key]) =>
            new RegExp(translationKey, 'gim').test(key)
        )

        if (!conf) return voiceURI

        const [, name] = conf
        return name
    }, [collection, translationKey])

    useEffect(() => {
        window.speechSynthesis.getVoices()
        const timeout = setTimeout(
            () => setVoices(window.speechSynthesis.getVoices()),
            300
        )
        return () => clearTimeout(timeout)
    }, [])

    return (
        <AppContext.Provider
            value={{
                words: words || [],
                collection,
                statistics: statistics || [],
                voices,
                nativeLang: {
                    voiceURI: collection?.nativeLang,
                    name: nativeName,
                    key: nativeKey,
                },
                translationLang: {
                    voiceURI: collection?.translationLang,
                    name: translationName,
                    key: translationKey,
                },
            }}
        >
            {children}
        </AppContext.Provider>
    )
}
