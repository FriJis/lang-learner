type native = string
type translation = string
type progress = number
type info = string

export type ExportedWordDeprecated = [
    native,
    translation,
    progress | undefined,
    info | undefined
]

export interface ExportedWordV1 {
    native: string
    translation: string
    progress?: number
    info?: string
    lastControllWork?: string
    continuouslyPassedTests?: number
}

export interface ExportedDataV1 {
    version: 1
    words: ExportedWordV1[]
}
