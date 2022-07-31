import {
    Button,
    Card,
    CardActions,
    CardContent,
    Input,
    Snackbar,
    Typography,
} from '@mui/material'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Word } from '../types/word'
import { getRandomValueFromArray, say } from '../utils'
import { composeWords } from '../utils/db'
import { compareTwoStrings } from 'string-similarity'
import { useUpdateProgress } from '../hooks/useUpdateProgress'
import { Form } from '../components/Form'
import { usePressBtn } from '../hooks/usePressBtn'
import { lsConf } from '../conf'
import { useLS } from '../hooks/useLS'
import { useStopWatch } from '../hooks/useStopWatch'

export const WritePage = () => {
    const [word, setWord] = useState<Word | null>(null)
    const [result, setResult] = useState('')
    const [helper, setHelper] = useState('')
    const [showPrev, setShowPrev] = useState(false)
    const [prev, setPrev] = useState<Word | null>(null)
    const stopWatch = useStopWatch()

    const [learnFirst] = useLS(lsConf.learn_first)
    const [translationLang] = useLS(lsConf.translationLang)
    const [nativeLang] = useLS(lsConf.nativeLang)

    const inputRef = useRef<HTMLInputElement>(null)

    const generate = useCallback(async () => {
        const words = await composeWords({
            learnFirst,
            prev: prev || undefined,
        })
        const word = getRandomValueFromArray(words)
        if (!word) return
        setResult('')
        setHelper('')
        setWord(word)
    }, [learnFirst, prev])

    const updater = useUpdateProgress(word)

    const compare = useCallback(async () => {
        if (!result) return
        if (!word) return
        const compared = compareTwoStrings(word.translation || '', result)
        const hintRatio = helper.length / word.translation.length

        await updater?.success(compared - hintRatio * 2)

        setPrev(word)
        setShowPrev(true)
        say(word.native, nativeLang)
        say(word.translation, translationLang)
    }, [result, word, updater, helper, translationLang, nativeLang])

    const help = useCallback(() => {
        if (!word) return
        const nextIndex = helper.length + 1
        const nextHint = word.translation.slice(0, nextIndex)
        if (helper === word.translation) {
            updater.fail()
            say(word.native, nativeLang)
            say(word.translation, translationLang)
            return setPrev(word)
        }
        setHelper(nextHint)
        inputRef.current?.click()
    }, [helper, word, inputRef, updater, nativeLang, translationLang])

    const idk = useCallback(() => {
        if (!word) return
        setPrev(word)
        setShowPrev(true)
        say(word.native, nativeLang)
        say(word.translation, translationLang)
        updater.fail()
        generate()
    }, [word, nativeLang, translationLang, generate, updater])

    usePressBtn(
        useCallback(
            (e) => {
                if (e.key === '+') {
                    e.preventDefault()
                    help()
                }
                if (e.key === '-') {
                    e.preventDefault()
                    idk()
                }
            },
            [help, idk]
        )
    )

    useEffect(() => {
        generate()
    }, [generate])

    return (
        <>
            <Snackbar
                open={showPrev}
                onClose={() => setShowPrev(false)}
                message={`${prev?.native} - ${prev?.translation}`}
                autoHideDuration={5000}
            ></Snackbar>
            <Form onSubmit={compare}>
                <Card>
                    <CardContent>
                        <Typography>Stopwatch: {stopWatch}</Typography>
                        <Typography>{word?.native}</Typography>
                        {helper.length > 0 && (
                            <Typography color={'gray'}>
                                Hint: {helper}
                            </Typography>
                        )}
                        <Input
                            ref={inputRef}
                            value={result}
                            placeholder="Translation..."
                            onChange={(e) => setResult(e.target.value)}
                            fullWidth
                        ></Input>
                    </CardContent>
                    <CardActions>
                        <Button onClick={help}>Hint with one letter (+)</Button>
                        <Button onClick={idk}>I don't know (-)</Button>
                        <Button
                            type="submit"
                            variant="contained"
                            color="success"
                        >
                            Check
                        </Button>
                    </CardActions>
                </Card>
            </Form>
        </>
    )
}
