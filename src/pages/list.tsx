import {
    Button,
    Input,
    Slider,
    Snackbar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material'
import { useLiveQuery } from 'dexie-react-hooks'
import _ from 'lodash'
import { FC, useCallback, useState } from 'react'
import { Word } from '../types/word'
import { db } from '../utils/db'

export const ListPage = () => {
    const [native, setNative] = useState('')
    const [translation, setTranslation] = useState('')
    const [showNativeNotification, setShowNativeNotification] = useState(false)
    const [showTranslationNotification, setShowTranslationNotification] =
        useState(false)

    const words = useLiveQuery(() => db.words.toArray())

    const add = useCallback(async () => {
        if (!native || !translation) return
        const words = await db.words.toArray()

        if (words.find((w) => w.native.trim() === native.trim()))
            return setShowNativeNotification(true)
        if (words.find((w) => w.translation.trim() === translation.trim()))
            return setShowTranslationNotification(true)

        await db.words.add({
            native: native.trim(),
            translation: translation.trim(),
            progress: 0,
        })
        setNative('')
        setTranslation('')
    }, [native, translation])

    return (
        <>
            <Snackbar
                open={showNativeNotification}
                onClose={() => setShowNativeNotification(false)}
                message='"Native" field has already existed'
                autoHideDuration={1000}
            ></Snackbar>
            <Snackbar
                open={showTranslationNotification}
                onClose={() => setShowTranslationNotification(false)}
                message='"Translation" field has already existed'
                autoHideDuration={1000}
            ></Snackbar>

            <TableContainer>
                <Table>
                    <TableHead>
                        <TableCell>Native</TableCell>
                        <TableCell>Translation</TableCell>
                        <TableCell colSpan={2}>Progress</TableCell>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell>
                                <Input
                                    value={native}
                                    onChange={(e) => setNative(e.target.value)}
                                    placeholder="Native..."
                                ></Input>
                            </TableCell>
                            <TableCell>
                                <Input
                                    value={translation}
                                    onChange={(e) =>
                                        setTranslation(e.target.value)
                                    }
                                    placeholder="Translation..."
                                ></Input>
                            </TableCell>
                            <TableCell></TableCell>
                            <TableCell>
                                <Button
                                    onClick={add}
                                    fullWidth
                                    color="success"
                                    variant="contained"
                                >
                                    Add
                                </Button>
                            </TableCell>
                        </TableRow>
                        {words?.map((word) => (
                            <WordItem word={word} key={word.id}></WordItem>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    )
}

const WordItem: FC<{ word: Word }> = ({ word }) => {
    const [newProgress, setNewProgress] = useState(word.progress)
    const del = useCallback(() => db.words.delete(word.id || 0), [word.id])

    const updateProgress = useCallback(
        () => db.words.update(word.id || 0, { progress: newProgress }),
        [newProgress, word.id]
    )

    return (
        <TableRow key={word.id}>
            <TableCell>{word.native}</TableCell>
            <TableCell>{word.translation}</TableCell>
            <TableCell style={{ width: 300 }}>
                <Slider
                    max={1}
                    step={0.01}
                    value={newProgress}
                    onChange={(e, v) => setNewProgress(_.isArray(v) ? v[0] : v)}
                    onChangeCommitted={updateProgress}
                ></Slider>
            </TableCell>
            <TableCell>
                <Button onClick={del} fullWidth color="error">
                    X
                </Button>
            </TableCell>
        </TableRow>
    )
}
