import {
    Backdrop,
    Button,
    CircularProgress,
    IconButton,
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
import { FC, useCallback, useEffect, useRef, useState } from 'react'
import { Word } from '../types/word'
import { db } from '../utils/db'

export const ListPage = () => {
    const [native, setNative] = useState('')
    const [translation, setTranslation] = useState('')
    const [showNativeNotification, setShowNativeNotification] = useState(false)
    const [showTranslationNotification, setShowTranslationNotification] =
        useState(false)

    const [showBackdrop, setShowBackdrop] = useState(false)

    const nativeRef = useRef<HTMLInputElement>(null)

    const words = useLiveQuery(() => db.words.toArray())

    const add = useCallback(async () => {
        if (!native || !translation) return
        const words = await db.words.toArray()

        if (words.find((w) => w.native.trim() === native.trim()))
            return setShowNativeNotification(true)
        if (words.find((w) => w.translation.trim() === translation.trim()))
            return setShowTranslationNotification(true)

        await db.words.add({
            native: native.trim().toLowerCase(),
            translation: translation.trim().toLowerCase(),
            progress: 0,
        })
        setNative('')
        setTranslation('')
    }, [native, translation])

    const changeSides = useCallback(async () => {
        if (!words) return
        setShowBackdrop(true)
        try {
            await Promise.all(
                words.map((word) =>
                    db.words.update(word, {
                        native: word.translation.trim().toLowerCase(),
                        translation: word.native.trim().toLowerCase(),
                    })
                )
            )
        } catch (error) {
            console.error(error)
        }
        setShowBackdrop(false)
    }, [words])

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                nativeRef.current?.click()
                add()
            }
        }

        document.addEventListener('keypress', handler)
        return () => document.removeEventListener('keypress', handler)
    }, [add, nativeRef])

    return (
        <>
            <Backdrop open={showBackdrop}>
                <CircularProgress color="inherit" />
            </Backdrop>
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
                        <TableRow>
                            <TableCell>Native </TableCell>
                            <TableCell width={50}>
                                <IconButton onClick={changeSides}>
                                    <i className="fa-solid fa-arrow-right-arrow-left"></i>
                                </IconButton>
                            </TableCell>
                            <TableCell>Translation</TableCell>
                            <TableCell width={300}>Progress</TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell>
                                <Input
                                    value={native}
                                    ref={nativeRef}
                                    onChange={(e) => setNative(e.target.value)}
                                    placeholder="Native..."
                                ></Input>
                            </TableCell>
                            <TableCell></TableCell>
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

    const changeSides = useCallback(() => {
        db.words.update(word, {
            native: word.translation.trim().toLowerCase(),
            translation: word.native.trim().toLowerCase(),
        })
    }, [word])

    return (
        <TableRow key={word.id}>
            <TableCell>
                <Input
                    value={word.native}
                    onChange={(e) =>
                        db.words.update(word, { native: e.target.value })
                    }
                ></Input>
            </TableCell>
            <TableCell>
                <IconButton onClick={changeSides}>
                    <i className="fa-solid fa-arrow-right-arrow-left"></i>
                </IconButton>
            </TableCell>
            <TableCell>
                <Input
                    value={word.translation}
                    onChange={(e) =>
                        db.words.update(word, { translation: e.target.value })
                    }
                ></Input>
            </TableCell>
            <TableCell>
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
                    <i className="fa-solid fa-trash"></i>
                </Button>
            </TableCell>
        </TableRow>
    )
}
