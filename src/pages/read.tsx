import {
    Button,
    Card,
    CardActions,
    CardContent,
    IconButton,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material'
import { useLiveQuery } from 'dexie-react-hooks'
import _ from 'lodash'
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { WordEditor } from '../components/WordEditor'
import { lsConf } from '../conf'
import { useLangs } from '../hooks/useLangs'
import { useLS } from '../hooks/useLS'
import { Word as IWord } from '../types/word'
import { normalize, say } from '../utils'
import { getWords } from '../utils/db'

export const ReadPage = () => {
    const [nativeWord, setNativeWord] = useState('')
    const [translationWord, setTranslationWord] = useState('')
    const [showEditor, setShowEditor] = useState(false)
    const textRef = useRef<HTMLPreElement>(null)

    const [reverse, setReverse] = useState(true)

    const [text, setText] = useState('')
    const words = useLiveQuery(() => getWords())

    const preparedText = useMemo(() => {
        const res = _.sortBy(words, (w) =>
            reverse ? w.translation.length : w.native.length
        )
            .reverse()
            ?.reduce<string>((acc, word) => {
                const w = reverse ? word.translation : word.native
                return acc.replace(
                    new RegExp(_.escapeRegExp(` ${w}`), 'gim'),
                    ` <<${w}>>`
                )
            }, text)
        const splitted = res?.split('<<')

        return (
            splitted?.reduce<string[]>((acc, exp) => {
                return [...acc, ...exp.split('>>')]
            }, []) || []
        )
    }, [text, words, reverse])
    const langs = useLangs(reverse)

    const [translator] = useLS(lsConf.translator)

    const showTranslation = useCallback(
        (text: string) => {
            if (!text) return
            const link = translator
                .replaceAll('{{translationLang}}', langs.translation.key || '')
                .replaceAll('{{nativeLang}}', langs.native.key || '')
                .replaceAll('{{text}}', text.trim())
            window.open(link, 'translator')
            setShowEditor(true)
            setNativeWord('')
            setTranslationWord('')
            if (reverse) return setTranslationWord(text)
            setNativeWord(text)
        },
        [langs, translator, reverse]
    )

    useEffect(() => {
        const { current } = textRef
        if (!current) return
        const h = () => {
            const text = document.getSelection()?.toString()
            if (!text) return
            showTranslation(text)
        }
        current.addEventListener('mouseup', h)
        return () => current.removeEventListener('mouseup', h)
    }, [showTranslation, textRef])

    const listen = useCallback(() => {
        if (window.speechSynthesis.speaking)
            return window.speechSynthesis.cancel()
        say(text, langs.native.key)
    }, [text, langs])

    const pause = useCallback(() => {
        if (window.speechSynthesis.paused)
            return window.speechSynthesis.resume()
        window.speechSynthesis.pause()
    }, [])

    useEffect(() => {
        return () => window.speechSynthesis.cancel()
    }, [])
    return (
        <>
            <Card>
                <CardContent>
                    <Typography>
                        From {langs.native.name}{' '}
                        <IconButton onClick={() => setReverse((o) => !o)}>
                            <i className="fa-solid fa-arrow-right-arrow-left"></i>
                        </IconButton>{' '}
                        to {langs.translation.name}
                    </Typography>

                    <TextField
                        maxRows={5}
                        multiline
                        fullWidth
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    ></TextField>
                </CardContent>
                <CardActions>
                    <Button onClick={listen}>listen\stop</Button>
                    <Button onClick={pause}>resume\pause</Button>
                </CardActions>
                <CardContent>
                    <Typography variant="h5" align="center">
                        Select the text or words below to see translation.
                    </Typography>
                </CardContent>
                <CardContent>
                    <Typography
                        component="pre"
                        whiteSpace={'pre-wrap'}
                        ref={textRef}
                    >
                        {preparedText.map((pr, i) => (
                            <Word words={words || []} word={pr} key={i}></Word>
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

const Word: FC<{
    word: string
    words: IWord[]
}> = ({ word, words }) => {
    const mappedWord = useMemo(
        () =>
            new Map<string, string>([
                ...words.map(
                    (w) => [w.native, w.translation] as [string, string]
                ),
                ...words.map(
                    (w) => [w.translation, w.native] as [string, string]
                ),
            ]),
        [words]
    )
    const translation = useMemo(
        () => mappedWord.get(normalize(word)),
        [word, mappedWord]
    )
    if (!translation) return <span>{word}</span>
    return (
        <Tooltip title={translation}>
            <span style={{ backgroundColor: 'wheat' }}>{word}</span>
        </Tooltip>
    )
}
