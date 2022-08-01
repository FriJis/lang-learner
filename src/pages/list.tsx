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
import { Nothing } from '../components/Nothing'
import { lsConf } from '../conf'
import { useLS } from '../hooks/useLS'
import { Word } from '../types/word'
import { normalize, regCheck } from '../utils'
import { db, getCollection, getWords } from '../utils/db'
import { swapWord } from '../utils/db'

export const ListPage = () => {
    const [native, setNative] = useState('')
    const [translation, setTranslation] = useState('')
    const [showNotification, setShowNotification] = useState(false)
    const [showBackdrop, setShowBackdrop] = useState(false)
    const [showTranslation, setShowTranslation] = useState(true)

    const [translationLang, setTranslationLang] = useLS(lsConf.translationLang)
    const [nativeLang, setNativeLang] = useLS(lsConf.nativeLang)

    const nativeRef = useRef<HTMLInputElement>(null)
    const words = useLiveQuery(() => getWords())

    const collection = useLiveQuery(() => getCollection())

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
        if (!!filteredWords?.length) return setShowNotification(true)
        const collection = await getCollection()
        if (!collection) return

        await db.words.add({
            native: normalize(native),
            translation: normalize(translation),
            progress: 0,
            collectionId: collection.id || 0,
        })

        setNative('')
        setTranslation('')
    }, [native, translation, filteredWords])

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

    if (!collection)
        return (
            <Nothing msg="Collection doesn't exist. You should create a collection into settings" />
        )

    return (
        <>
            <Backdrop open={showBackdrop}>
                <CircularProgress color="inherit" />
            </Backdrop>
            <Snackbar
                open={showNotification}
                onClose={() => setShowNotification(false)}
                message="It already exists"
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
                            <TableCell>
                                Translation{' '}
                                <IconButton
                                    onClick={() =>
                                        setShowTranslation((o) => !o)
                                    }
                                    size="small"
                                >
                                    {showTranslation ? (
                                        <i className="fa-solid fa-eye-slash"></i>
                                    ) : (
                                        <i className="fa-solid fa-eye"></i>
                                    )}
                                </IconButton>
                            </TableCell>
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
                            <TableCell>
                                {words?.reduce(
                                    (acc, w) =>
                                        w.progress >= 1 ? acc + 1 : acc,
                                    0
                                ) || 0}
                                /{words?.length || 0}
                            </TableCell>
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
                            <WordItem
                                word={word}
                                key={word.id}
                                showTranslation={showTranslation}
                            ></WordItem>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    )
}

const WordItem: FC<{ word: Word; showTranslation?: boolean }> = ({
    word,
    showTranslation,
}) => {
    const [updWord, setUpdWord] = useState(word)
    const [newProgress, setNewProgress] = useState(word.progress)

    const del = useCallback(() => db.words.delete(word.id || 0), [word.id])

    const updateProgress = useCallback(
        () => db.words.update(word.id || 0, { progress: newProgress }),
        [newProgress, word.id]
    )

    useEffect(() => {
        setUpdWord(word)
    }, [word])

    const saveWord = useCallback(() => {
        db.words.update(word, updWord)
    }, [word, updWord])

    const changeSides = useCallback(() => {
        swapWord(word)
    }, [word])

    return (
        <TableRow key={word.id} onFocus={() => {}}>
            <TableCell>
                <Input
                    value={updWord.native}
                    onChange={(e) =>
                        setUpdWord((o) => ({ ...o, native: e.target.value }))
                    }
                    endAdornment={
                        <IconButton size="small" onClick={saveWord}>
                            <i className="fa-solid fa-floppy-disk"></i>
                        </IconButton>
                    }
                ></Input>
            </TableCell>
            <TableCell>
                <IconButton onClick={changeSides}>
                    <i className="fa-solid fa-arrow-right-arrow-left"></i>
                </IconButton>
            </TableCell>
            <TableCell>
                {showTranslation ? (
                    <Input
                        value={updWord.translation}
                        onChange={(e) =>
                            setUpdWord((o) => ({
                                ...o,
                                translation: e.target.value,
                            }))
                        }
                        endAdornment={
                            <IconButton size="small" onClick={saveWord}>
                                <i className="fa-solid fa-floppy-disk"></i>
                            </IconButton>
                        }
                    ></Input>
                ) : (
                    <Input value="..." disabled></Input>
                )}
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
