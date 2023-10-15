export type State<T> = [T, React.Dispatch<React.SetStateAction<T>>]

export interface AppLang {
    voiceURI?: string
    key?: string
    name: string
}
