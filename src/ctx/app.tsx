import {
    FC,
    PropsWithChildren,
    createContext,
    useContext,
    useMemo,
} from 'react'
import { Word } from '../types/word'
import { useLiveQuery } from 'dexie-react-hooks'
import { getCollection, getStatistics, getWords } from '../utils/db'
import { Collection } from '../types/collection'
import { Statistics } from '../types/statistics'
import { AppLang } from '../types/app'
import { getLangByVoiceURI } from '../utils'
import { languagesConfig } from '../conf'

export const AppContext = createContext<{
    words: Word[]
    collection?: Collection
    statistics: Statistics[]
    nativeLang?: AppLang
    translationLang?: AppLang
}>({ words: [], statistics: [] })

export const useAppContext = () => useContext(AppContext)

export const AppContextProvider: FC<PropsWithChildren> = ({ children }) => {
    const words = useLiveQuery(() => getWords())
    const collection = useLiveQuery(() => getCollection())
    const statistics = useLiveQuery(() => getStatistics())

    const nativeName = useMemo(() => {
        const langKey = getLangByVoiceURI(collection?.nativeLang || '')
        const name = languagesConfig.get(langKey || '')
        return name || langKey || 'Native'
    }, [collection])

    const translationName = useMemo(() => {
        const langKey = getLangByVoiceURI(collection?.translationLang || '')
        const name = languagesConfig.get(langKey || '')
        return name || langKey || 'Translation'
    }, [collection])

    return (
        <AppContext.Provider
            value={{
                words: words || [],
                collection,
                statistics: statistics || [],
                nativeLang: { key: collection?.nativeLang, name: nativeName },
                translationLang: {
                    key: collection?.translationLang,
                    name: translationName,
                },
            }}
        >
            {children}
        </AppContext.Provider>
    )
}
