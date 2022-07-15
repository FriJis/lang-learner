export interface Word {
    id?: number
    native: string
    translation: string
    progress: number
}

type native = string
type translation = string
type progress = number

export type ExportedWord = [native, translation, progress]
