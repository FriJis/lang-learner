export type State<T> = [T, React.Dispatch<React.SetStateAction<T>>]

export interface AppLang {
    key?: string
    name: string
}
