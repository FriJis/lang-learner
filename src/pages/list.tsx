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
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import useLocalStorageState from 'use-local-storage-state'
import { lsConf } from '../conf'
import { Word } from '../types/word'
import { normalize, regCheck } from '../utils'
import { db } from '../utils/db'
import { swapWord } from '../utils/db'

export const ListPage = () => {
    const [native, setNative] = useState('')
    const [translation, setTranslation] = useState('')

    const [showNotification, setShowNotification] = useState(false)

    const [showBackdrop, setShowBackdrop] = useState(false)

    const [translationLang, setTranslationLang] = useLocalStorageState(
        lsConf.translationLang.name,
        {
            defaultValue: lsConf.translationLang.def,
        }
    )
    const [nativeLang, setNativeLang] = useLocalStorageState(
        lsConf.nativeLang.name,
        {
            defaultValue: lsConf.nativeLang.def,
        }
    )

    const nativeRef = useRef<HTMLInputElement>(null)

    const words = useLiveQuery(() => db.words.toArray())

    const filteredWords = useMemo(
        () =>
            words?.filter(
                (w) =>
                    regCheck(w.native, native) &&
                    regCheck(w.translation, translation)
            ),
        [native, words, translation]
    )

    const add = useCallback(async () => {
        if (!native || !translation) return
        const words = await db.words.toArray()

        if (words.length > 0) return setShowNotification(true)

        await db.words.add({
            native: normalize(native),
            translation: normalize(translation),
            progress: 0,
        })
        setNative('')
        setTranslation('')
    }, [native, translation])

    const changeSides = useCallback(async () => {
        if (!words) return
        setShowBackdrop(true)
        try {
            await Promise.all(words.map((word) => swapWord(word)))
            const oldNativeLang = nativeLang
            setNativeLang(translationLang)
            setTranslationLang(oldNativeLang)
        } catch (error) {
            console.error(error)
        }
        setShowBackdrop(false)
    }, [words, translationLang, nativeLang, setNativeLang, setTranslationLang])

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
                open={showNotification}
                onClose={() => setShowNotification(false)}
                message="It has already existed"
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
                        {filteredWords?.map((word) => (
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
        swapWord(word)
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
