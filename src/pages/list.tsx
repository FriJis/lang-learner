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
    Typography,
} from '@mui/material'
import { useLiveQuery } from 'dexie-react-hooks'
import _ from 'lodash'
import { FC, useCallback, useMemo, useRef, useState } from 'react'
import { Nothing } from '../components/Nothing'
import { WordEditor } from '../components/WordEditor'
import { useLangs } from '../hooks/useLangs'
import { Word } from '../types/word'
import { regCheck, sayNative, sayTranslation } from '../utils'
import { db, getCollection, getWords } from '../utils/db'
import { swapWord } from '../utils/db'

export const ListPage = () => {
    const [native, setNative] = useState('')
    const [translation, setTranslation] = useState('')

    const [showAdd, setShowAdd] = useState(false)
    const [showNotification, setShowNotification] = useState(false)
    const [showBackdrop, setShowBackdrop] = useState(false)
    const [showTranslation, setShowTranslation] = useState(true)

    const nativeRef = useRef<HTMLInputElement>(null)
    const words = useLiveQuery(() => getWords())

    const langs = useLangs()

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

    const changeSides = useCallback(async () => {
        if (!words) return
        setShowBackdrop(true)
        try {
            await Promise.all(words.map((word) => swapWord(word)))
            const collection = await getCollection()
            if (!collection) return
            db.collections.update(collection, {
                nativeLang: collection.translationLang,
                translationLang: collection.nativeLang,
            })
        } catch (error) {
            console.error(error)
        }
        setShowBackdrop(false)
    }, [words])

    if (!collection)
        return (
            <Nothing msg="Collection doesn't exist. You should create a collection into settings" />
        )

    return (
        <>
            <WordEditor
                nativeState={[native, setNative]}
                translationState={[translation, setTranslation]}
                show={showAdd}
                onClose={() => setShowAdd(false)}
            ></WordEditor>
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
                            <TableCell>{langs.native.name}</TableCell>
                            <TableCell width={50}>
                                <IconButton onClick={changeSides}>
                                    <i className="fa-solid fa-arrow-right-arrow-left"></i>
                                </IconButton>
                            </TableCell>
                            <TableCell>
                                {langs.translation.name}{' '}
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
                            <TableCell>
                                <Button
                                    onClick={() => setShowAdd(true)}
                                    fullWidth
                                    color="success"
                                >
                                    <i className="fa-solid fa-plus"></i>
                                </Button>
                            </TableCell>
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
                                    placeholder={`Native...`}
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
                            <TableCell></TableCell>
                            <TableCell></TableCell>
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
    const [showEditor, setShowEditor] = useState(false)
    const [newProgress, setNewProgress] = useState(word.progress)

    const nativeState = useState('')
    const translationState = useState('')

    const del = useCallback(() => {
        if (!window.confirm('Delete this word?')) return
        db.words.delete(word.id || 0)
    }, [word.id])

    const updateProgress = useCallback(
        () => db.words.update(word.id || 0, { progress: newProgress }),
        [newProgress, word.id]
    )

    const changeSides = useCallback(() => {
        swapWord(word)
    }, [word])

    const say = useCallback((text: string, type: 'translation' | 'native') => {
        if (type === 'translation') return sayTranslation(text)
        return sayNative(text)
    }, [])

    const stopSay = useCallback(() => {
        window.speechSynthesis.cancel()
    }, [])

    return (
        <>
            <WordEditor
                word={word}
                show={showEditor}
                onClose={() => setShowEditor(false)}
                nativeState={nativeState}
                translationState={translationState}
            ></WordEditor>
            <TableRow key={word.id} onFocus={() => {}}>
                <TableCell
                    onMouseEnter={() => say(word.native, 'native')}
                    onMouseLeave={() => stopSay()}
                >
                    <Typography>{word.native}</Typography>
                </TableCell>
                <TableCell>
                    <IconButton onClick={changeSides}>
                        <i className="fa-solid fa-arrow-right-arrow-left"></i>
                    </IconButton>
                </TableCell>

                {showTranslation ? (
                    <TableCell
                        onMouseEnter={() =>
                            say(word.translation, 'translation')
                        }
                        onMouseLeave={() => stopSay()}
                    >
                        <Typography>{word.translation}</Typography>
                    </TableCell>
                ) : (
                    <TableCell>
                        <Typography>...</Typography>
                    </TableCell>
                )}
                <TableCell>
                    <Slider
                        max={1}
                        step={0.01}
                        value={newProgress}
                        onChange={(e, v) =>
                            setNewProgress(_.isArray(v) ? v[0] : v)
                        }
                        onChangeCommitted={updateProgress}
                    ></Slider>
                </TableCell>
                <TableCell>
                    <Button onClick={() => setShowEditor(true)} fullWidth>
                        <i className="fa-solid fa-pen-to-square"></i>
                    </Button>
                </TableCell>
                <TableCell>
                    <Button onClick={del} fullWidth color="error">
                        <i className="fa-solid fa-trash"></i>
                    </Button>
                </TableCell>
            </TableRow>
        </>
    )
}
