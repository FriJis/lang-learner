import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    TextField,
    Typography,
} from '@mui/material'
import _ from 'lodash'
import moment from 'moment'
import { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { State } from '../types/app'
import { StatisticsType } from '../types/statistics'
import { Word } from '../types/word'
import { findWords, normalize } from '../utils'
import { db, getCollection } from '../utils/db'
import { useAppContext } from '../ctx/app'

export const WordEditor: FC<{
    word?: Word
    nativeState: State<string>
    translationState: State<string>
    show: boolean
    onClose: () => void
}> = ({ word, onClose, show, nativeState, translationState }) => {
    const [native, setNative] = nativeState
    const [translation, setTranslation] = translationState
    const [info, setInfo] = useState(word?.info || '')
    const { words, nativeLang, translationLang } = useAppContext()

    useEffect(() => {
        setNative(word?.native || '')
        setTranslation(word?.translation || '')
        setInfo(word?.info || '')
    }, [word, setNative, setTranslation])

    const count = useMemo(
        () =>
            !_.isUndefined(word)
                ? 0
                : findWords(words || [], native, translation).length,
        [words, native, translation, word]
    )

    const save = useCallback(async () => {
        const collection = await getCollection()
        const collectionId = collection?.id
        if (!collectionId) return
        const data = {
            native: normalize(native),
            translation: normalize(translation),
            info,
        }

        if (!word) {
            await db.transaction('rw', db.words, db.statistics, async () => {
                await db.statistics.add({
                    createdAt: moment.utc().toISOString(),
                    metaValue: `${data.native} - ${data.translation}`,
                    type: StatisticsType.addedWord,
                    collectionId,
                })
                await db.words.add({
                    ...data,
                    progress: 0,
                    collectionId,
                })
            })
        } else {
            await db.words.update(word, data)
        }

        setInfo('')
        setNative('')
        setTranslation('')

        onClose()
    }, [word, native, translation, onClose, info, setNative, setTranslation])

    return (
        <Dialog open={show} onClose={onClose}>
            <DialogContent sx={{ '& .MuiTextField-root': { mt: 1 } }}>
                <TextField
                    fullWidth
                    label={nativeLang?.name}
                    variant="standard"
                    value={native}
                    onChange={(e) => setNative(e.target.value)}
                ></TextField>
                <TextField
                    fullWidth
                    label={translationLang?.name}
                    variant="standard"
                    value={translation}
                    onChange={(e) => setTranslation(e.target.value)}
                ></TextField>
                <TextField
                    fullWidth
                    label="Info"
                    variant="standard"
                    value={info}
                    onChange={(e) => setInfo(e.target.value)}
                ></TextField>
                {!word && (
                    <Typography marginTop={'10px'}>
                        Already exists: {count}
                    </Typography>
                )}
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} color="error">
                    close
                </Button>
                <Button onClick={save}>save</Button>
            </DialogActions>
        </Dialog>
    )
}
