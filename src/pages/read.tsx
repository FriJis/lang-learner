import {
    Card,
    CardContent,
    IconButton,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material'
import { useLiveQuery } from 'dexie-react-hooks'
import { FC, useCallback, useMemo, useState } from 'react'
import { WordEditor } from '../components/WordEditor'
import { lsConf, mapLangsByKey } from '../conf'
import { useLS } from '../hooks/useLS'
import { getCollection, getWords } from '../utils/db'

export const ReadPage = () => {
    const [nativeWord, setNativeWord] = useState('')
    const [translationWord, setTranslationWord] = useState('')
    const [showEditor, setShowEditor] = useState(false)

    const [reverse, setReverse] = useState(true)

    const [text, setText] = useState('')
    const preparedText = useMemo(
        () => text.split(/\n/).map((pr) => pr.split(' ')),
        [text]
    )
    const collection = useLiveQuery(() => getCollection())
    const words = useLiveQuery(() => getWords())
    const mappedWord = useMemo(
        () =>
            new Map<string, string>([
                ...(words || []).map(
                    (w) => [w.native, w.translation] as [string, string]
                ),
                ...(words || []).map(
                    (w) => [w.translation, w.native] as [string, string]
                ),
            ]),
        [words]
    )

    const nativeLang = useMemo(() => collection?.nativeLang, [collection])
    const translationLang = useMemo(
        () => collection?.translationLang,
        [collection]
    )
    const finalTranslationLang = useMemo(
        () => (!reverse ? translationLang : nativeLang),
        [reverse, translationLang, nativeLang]
    )
    const finalNativeLang = useMemo(
        () => (reverse ? translationLang : nativeLang),
        [reverse, translationLang, nativeLang]
    )
    const [translator] = useLS(lsConf.translator)

    const showTranslation = useCallback(
        (text: string) => {
            if (!text) return
            const link = translator
                .replaceAll('{{translationLang}}', finalTranslationLang || '')
                .replaceAll('{{nativeLang}}', finalNativeLang || '')
                .replaceAll('{{text}}', text.trim())
            window.open(link, 'translator')
            setShowEditor(true)
            setNativeWord('')
            setTranslationWord('')
            if (reverse) return setTranslationWord(text)
            setNativeWord(text)
        },
        [finalNativeLang, finalTranslationLang, translator, reverse]
    )
    return (
        <>
            <Card>
                <CardContent>
                    <Typography>
                        From {mapLangsByKey.get(finalNativeLang || '')}{' '}
                        <IconButton onClick={() => setReverse((o) => !o)}>
                            <i className="fa-solid fa-arrow-right-arrow-left"></i>
                        </IconButton>{' '}
                        to {mapLangsByKey.get(finalTranslationLang || '')}
                    </Typography>
                    <TextField
                        maxRows={5}
                        multiline
                        fullWidth
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    ></TextField>
                </CardContent>
                <CardContent>
                    <Typography component="pre" whiteSpace={'pre-wrap'}>
                        {preparedText.map((pr, i) => (
                            <Typography key={i}>
                                {pr.map((word, i) => (
                                    <Word
                                        word={word}
                                        key={i}
                                        showTranslation={showTranslation}
                                    ></Word>
                                ))}
                            </Typography>
                        ))}
                    </Typography>
                </CardContent>
            </Card>
            <WordEditor
                nativeState={[nativeWord, setNativeWord]}
                translationState={[translationWord, setTranslationWord]}
                show={showEditor}
                onClose={() => setShowEditor(false)}
            ></WordEditor>
        </>
    )
}

const Word: FC<{ word: string; showTranslation: (text: string) => void }> = ({
    word,
    showTranslation,
}) => {
    const words = useLiveQuery(() => getWords())
    const mappedWord = useMemo(
        () =>
            new Map<string, string>([
                ...(words || []).map(
                    (w) => [w.native, w.translation] as [string, string]
                ),
                ...(words || []).map(
                    (w) => [w.translation, w.native] as [string, string]
                ),
            ]),
        [words]
    )
    const translation = useMemo(() => mappedWord.get(word), [word, mappedWord])
    if (!translation)
        return <span onClick={() => showTranslation(word)}>{`${word} `}</span>
    return (
        <Tooltip title={translation}>
            <span style={{ backgroundColor: 'wheat' }}>{`${word} `}</span>
        </Tooltip>
    )
}
