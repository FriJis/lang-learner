export interface Word {
    id?: number
    collectionId: number
    native: string
    translation: string
    progress: number
    info?: string
    lastControllWork?: string
    continuouslyPassedTests?: number
}
