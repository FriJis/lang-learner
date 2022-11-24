export enum StatisticsType {
    learnedWord = 'learnedWord',
    addedWord = 'addedWord',
    passedFinalTest = 'passedFinalTest',
    auditedText = 'auditedText',
}

export interface Statistics {
    id?: number
    metaValue?: string
    collectionId: number
    type: StatisticsType
    createdAt: string
}
