import Dexie, { Table } from 'dexie'
import { normalize } from '.'
import { Word } from '../types/word'

export class MySubClassedDexie extends Dexie {
    words!: Table<Word>

    constructor() {
        super('app')
        this.version(1).stores({
            words: '++id, native, translation, progress', // Primary key and indexed props
        })
    }
}

export const db = new MySubClassedDexie()

export async function swapWord(word: Word) {
    const newVal = {
        ...word,
        native: normalize(word.translation),
        translation: normalize(word.native),
    }
    await db.words.update(word, newVal)
    return newVal
}
