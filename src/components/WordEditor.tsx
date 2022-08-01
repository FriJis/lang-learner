import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    TextField,
} from '@mui/material'
import { FC, useCallback, useEffect, useState } from 'react'
import { Word } from '../types/word'
import { normalize } from '../utils'
import { db, getCollection } from '../utils/db'

export const WordEditor: FC<{
    word?: Word
    show: boolean
    onClose: () => void
}> = ({ word, onClose, show }) => {
    const [native, setNative] = useState(word?.native || '')
    const [translation, setTranslation] = useState(word?.translation || '')
    const [info, setInfo] = useState(word?.info || '')

    useEffect(() => {
        setNative(word?.native || '')
        setTranslation(word?.translation || '')
        setInfo(word?.info || '')
    }, [word])

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
    }, [word, native, translation, onClose, info])

    return (
        <Dialog open={show} onClose={onClose}>
            <DialogContent sx={{ '& .MuiTextField-root': { mt: 1 } }}>
                <TextField
                    fullWidth
                    label="Native"
                    variant="standard"
                    value={native}
                    onChange={(e) => setNative(e.target.value)}
                ></TextField>
                <TextField
                    fullWidth
                    label="Translation"
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
