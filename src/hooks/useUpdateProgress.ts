import moment from 'moment'
import { useCallback } from 'react'
import useLocalStorageState from 'use-local-storage-state'
import { lsConf } from '../conf'
import { StatisticsType } from '../types/statistics'
import { Word } from '../types/word'
import { db, getCollection } from '../utils/db'
import { minMax } from '../utils'

export function useUpdateProgress(word?: Word | null) {
    const [successOffset] = useLocalStorageState(lsConf.success_offset.name, {
        defaultValue: lsConf.success_offset.def,
    })
    const [mistakeOffset] = useLocalStorageState(lsConf.mistake_offset.name, {
        defaultValue: lsConf.mistake_offset.def,
    })

    const fail = useCallback(() => {
        if (!word?.id) return null
        const progress = minMax(word.progress * mistakeOffset, 0, 1)
        return db.words.update(word.id, {
            progress,
        })
    }, [word, mistakeOffset])

    const success = useCallback(
        async (offset?: number) => {
            if (!word) return null
            const progress = minMax(
                word.progress + successOffset * (offset || 1),
                0,
                1
            )

            await db.transaction(
                'rw',
                db.words,
                db.statistics,
                db.collections,
                async () => {
                    if (progress >= 1) {
                        const collection = await getCollection()
                        const collectionId = collection?.id
                        if (!collectionId)
                            throw new Error('Collection is undefined')

                        await db.statistics.add({
                            collectionId,
                            createdAt: moment().utc().toISOString(),
                            metaValue: `${word.native} - ${word.translation}`,
                            type: StatisticsType.learnedWord,
                        })
                    }
                    await db.words.update(word.id || 0, {
                        progress,
                    })
                }
            )
        },
        [word, successOffset]
    )

    return {
        fail,
        success,
    }
}
