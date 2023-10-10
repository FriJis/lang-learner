import {
    Backdrop,
    CircularProgress,
    IconButton,
    Input,
    Snackbar,
    Typography,
} from '@mui/material'
import { FC, useCallback, useMemo, useRef, useState } from 'react'
import { Nothing } from '../components/Nothing'
import { WordEditor } from '../components/WordEditor'
import { useLangs } from '../hooks/useLangs'
import { Word } from '../types/word'
import { findWords, sayNative, sayTranslation } from '../utils'
import { db, getCollection } from '../utils/db'
import { swapWord } from '../utils/db'
import { useAppContext } from '../ctx/app'
import styles from './list.module.scss'
import { colors } from '../conf'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import CompareArrowsIcon from '@mui/icons-material/CompareArrows'
import PlayCircleIcon from '@mui/icons-material/PlayCircle'

export const ListPage = () => {
    const [native, setNative] = useState('')
    const [translation, setTranslation] = useState('')

    const [showAdd, setShowAdd] = useState(false)
    const [showNotification, setShowNotification] = useState(false)
    const [showBackdrop, setShowBackdrop] = useState(false)
    const [showTranslation, setShowTranslation] = useState(true)

    const { words, collection } = useAppContext()

    const nativeRef = useRef<HTMLInputElement>(null)

    const { nativeLang, translationLang } = useLangs()

    const filteredWords = useMemo(
        () => findWords(words || [], native, translation),
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

            <div className={styles.container}>
                <div className={styles.row}>
                    <div className={styles.word}>
                        <Typography>{nativeLang?.name}</Typography>
                    </div>
                    <div className={styles.button}>
                        <IconButton onClick={changeSides}>
                            <CompareArrowsIcon />
                        </IconButton>
                    </div>
                    <div className={styles.word}>
                        <Typography>{translationLang?.name} </Typography>
                        <IconButton
                            onClick={() => setShowTranslation((o) => !o)}
                        >
                            {showTranslation ? (
                                <VisibilityIcon />
                            ) : (
                                <VisibilityOffIcon />
                            )}
                        </IconButton>
                    </div>
                    <div className={styles.button} />
                    <div className={styles.button}>
                        <IconButton
                            onClick={() => setShowAdd(true)}
                            color="success"
                        >
                            <AddIcon />
                        </IconButton>
                    </div>
                </div>
                <div className={styles.row}>
                    <div className={styles.word}>
                        <Input
                            value={native}
                            ref={nativeRef}
                            onChange={(e) => setNative(e.target.value)}
                            placeholder={`Native...`}
                        />
                    </div>
                    <div className={styles.button}></div>
                    <div className={styles.word}>
                        <Input
                            value={translation}
                            onChange={(e) => setTranslation(e.target.value)}
                            placeholder="Translation..."
                        />
                    </div>
                    <div className={styles.button}>
                        <Typography>
                            {words?.reduce(
                                (acc, w) => (w.progress >= 1 ? acc + 1 : acc),
                                0
                            ) || 0}
                            /{words?.length || 0}
                        </Typography>
                    </div>
                    <div className={styles.button}></div>
                </div>
                {filteredWords?.map((word) => (
                    <WordItem
                        word={word}
                        key={word.id}
                        showTranslation={showTranslation}
                    ></WordItem>
                ))}
            </div>
        </>
    )
}

const WordItem: FC<{ word: Word; showTranslation?: boolean }> = ({
    word,
    showTranslation,
}) => {
    const [showEditor, setShowEditor] = useState(false)
    const nativeState = useState('')
    const translationState = useState('')

    const del = useCallback(() => {
        if (!window.confirm('Delete this word?')) return
        db.words.delete(word.id || 0)
    }, [word.id])

    const changeSides = useCallback(() => {
        swapWord(word)
    }, [word])

    const say = useCallback((text: string, type: 'translation' | 'native') => {
        if (type === 'translation') return sayTranslation(text)
        return sayNative(text)
    }, [])

    const bg = useMemo(() => {
        if (word.progress >= 1) return colors.green
        return colors.yellow
    }, [word])

    const progress = useMemo(() => {
        if (word.progress <= 0) return 0
        if (word.progress >= 1) return 1
        return word.progress
    }, [word])

    return (
        <>
            <WordEditor
                word={word}
                show={showEditor}
                onClose={() => setShowEditor(false)}
                nativeState={nativeState}
                translationState={translationState}
            ></WordEditor>
            <div className={styles.row}>
                <div
                    className={styles.progress}
                    style={{ width: `${progress * 100}%`, backgroundColor: bg }}
                />
                <div className={styles.word}>
                    <IconButton onClick={() => say(word.native, 'native')}>
                        <PlayCircleIcon />
                    </IconButton>
                    <Typography>{word.native}</Typography>
                </div>
                <div className={styles.button}>
                    <IconButton onClick={changeSides}>
                        <CompareArrowsIcon />
                    </IconButton>
                </div>
                <div className={styles.word}>
                    {showTranslation ? (
                        <>
                            <IconButton
                                onClick={() =>
                                    say(word.translation, 'translation')
                                }
                            >
                                <PlayCircleIcon />
                            </IconButton>
                            <Typography>{word.translation}</Typography>
                        </>
                    ) : (
                        <Typography>...</Typography>
                    )}
                </div>
                <div className={styles.button}>
                    <IconButton onClick={() => setShowEditor(true)}>
                        <EditIcon />
                    </IconButton>
                </div>
                <div className={styles.button}>
                    <IconButton onClick={del} color="error">
                        <DeleteIcon />
                    </IconButton>
                </div>
            </div>
        </>
    )
}
