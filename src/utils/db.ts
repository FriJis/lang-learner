import Dexie, { Table } from 'dexie'
import _ from 'lodash'
import { normalize } from '.'
import { Collection } from '../types/collection'
import { Word } from '../types/word'

export class MySubClassedDexie extends Dexie {
    words!: Table<Word>
    collections!: Table<Collection>

    constructor() {
        super('app')
        this.version(1).stores({
            words: '++id, native, translation, progress',
        })
        this.version(2)
            .stores({
                words: '++id, collectionId, native, translation, progress',
                collections: '++id, name, active',
            })
            .upgrade(async (tx) => {
                await tx
                    .table('collections')
                    .add({ id: 1, name: 'Default', active: true })
                await tx
                    .table('words')
                    .toCollection()
                    .modify((word) => {
                        word.collectionId = 1
                    })
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

export const getCollection = () =>
    db.collections.toArray().then((cls) => cls.find((cl) => cl.active))

export async function getWords() {
    const collection = await getCollection()
    if (!collection) return []
    return db.words
        .where('collectionId')
        .equals(collection.id || 0)
        .sortBy('id')
}

export async function composeWords(adds?: { learnFirst: number; prev?: Word }) {
    const { prev, learnFirst } = adds || {}
    let words = await getWords().then((words) =>
        words.filter((word) => word.progress < 1)
    )
    if (!_.isUndefined(learnFirst) && learnFirst > 0) {
        words = _.slice(words, 0, learnFirst)
    }
    if (words.length > 1 && prev?.id) {
        words = words.filter((w) => w.id !== prev.id)
    }
    return words
}
