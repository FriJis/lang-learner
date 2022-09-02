import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    TextField,
} from '@mui/material'
import { FC, useCallback, useEffect, useState } from 'react'
import { useLangs } from '../hooks/useLangs'
import { State } from '../types/app'
import { Word } from '../types/word'
import { normalize } from '../utils'
import { db, getCollection } from '../utils/db'

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
    const langs = useLangs()

    useEffect(() => {
        setNative(word?.native || '')
        setTranslation(word?.translation || '')
        setInfo(word?.info || '')
    }, [word, setNative, setTranslation])

    const save = useCallback(async () => {
        const collection = await getCollection()
        if (!collection?.id) return
        const data = {
            native: normalize(native),
            translation: normalize(translation),
            info,
        }

        if (!word) {
            await db.words.add({
                ...data,
                progress: 0,
                collectionId: collection.id,
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
                    label={langs.native.name}
                    variant="standard"
                    value={native}
                    onChange={(e) => setNative(e.target.value)}
                ></TextField>
                <TextField
                    fullWidth
                    label={langs.translation.name}
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
