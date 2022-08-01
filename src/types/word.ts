export interface Word {
    id?: number
    collectionId: number
    native: string
    translation: string
    progress: number
    info?: string
}

type native = string
type translation = string
type progress = number

export type ExportedWord = [native, translation, progress]
