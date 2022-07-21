import Dexie, { Table } from 'dexie'
import _ from 'lodash'
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

export async function composeWords(adds?: { learnFirst: number; prev?: Word }) {
    const { prev, learnFirst } = adds || {}
    let words = await db.words.where('progress').below(1).sortBy('id')
    if (!_.isUndefined(learnFirst) && learnFirst > 0) {
        words = _.slice(words, 0, learnFirst)
    }
    if (words.length > 1 && prev?.id) {
        words = words.filter((w) => w.id !== prev.id)
    }
    return words
}
