import { useCallback } from 'react'
import useLocalStorageState from 'use-local-storage-state'
import { lsConf } from '../conf'
import { Word } from '../types/word'
import { db } from '../utils/db'

export function useUpdateProgress(word?: Word | null) {
    const [successOffset] = useLocalStorageState(lsConf.success_offset.name, {
        defaultValue: lsConf.success_offset.def,
    })
    const [mistakeOffset] = useLocalStorageState(lsConf.mistake_offset.name, {
        defaultValue: lsConf.mistake_offset.def,
    })

    const fail = useCallback(() => {
        if (!word) return null
        return db.words.update(word.id || 0, {
            progress: word.progress * mistakeOffset,
        })
    }, [word, mistakeOffset])

    const success = useCallback(
        (offset?: number) => {
            if (!word) return null
            return db.words.update(word.id || 0, {
                progress: word.progress + successOffset * (offset || 1),
            })
        },
        [word, successOffset]
    )

    return {
        fail,
        success,
    }
}
