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
import { getRandomValueFromArray, sayNative, sayTranslation } from '../utils'
import { composeWords } from '../utils/db'
import { compareTwoStrings } from 'string-similarity'
import { useUpdateProgress } from '../hooks/useUpdateProgress'
import { Form } from '../components/Form'
import { usePressBtn } from '../hooks/usePressBtn'
import { lsConf } from '../conf'
import { useLS } from '../hooks/useLS'
import { useStopWatch } from '../hooks/useStopWatch'
import { Nothing } from '../components/Nothing'
import { Info } from '../components/Info'

export const WritePage = () => {
    const [word, setWord] = useState<Word | null>(null)
    const [result, setResult] = useState('')
    const [helper, setHelper] = useState('')
    const [showPrev, setShowPrev] = useState(false)
    const [prev, setPrev] = useState<Word | null>(null)
    const stopWatch = useStopWatch()

    const [learnFirst] = useLS(lsConf.learn_first)

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
        sayNative(word.native)
        sayTranslation(word.translation)
    }, [result, word, updater, helper])

    const help = useCallback(() => {
        if (!word) return
        const nextIndex = helper.length + 1
        const nextHint = word.translation.slice(0, nextIndex)
        inputRef.current?.click()
        if (helper === word.translation) {
            updater.fail()
            sayNative(word.native)
            sayTranslation(word.translation)
            return setPrev(word)
        }
        setHelper(nextHint)
    }, [helper, word, inputRef, updater])

    const idk = useCallback(() => {
        if (!word) return
        setPrev(word)
        setShowPrev(true)
        sayNative(word.native)
        sayTranslation(word.translation)
        updater.fail()
        generate()
        inputRef.current?.click()
    }, [word, generate, updater, inputRef])

    usePressBtn(
        useCallback(
            (e) => {
                if (!e.ctrlKey) return
                if (e.key === 'h') {
                    e.preventDefault()
                    help()
                }
                if (e.key === 'i') {
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

    if (!word) return <Nothing></Nothing>

    return (
        <>
            <Snackbar
                open={showPrev}
                onClose={() => setShowPrev(false)}
                message={`${prev?.native} - ${prev?.translation} ${
                    !!prev?.info ? `(${prev.info})` : ''
                }`}
                autoHideDuration={5000}
            ></Snackbar>
            <Form onSubmit={compare}>
                <Card>
                    <CardContent>
                        <Typography>Stopwatch: {stopWatch}</Typography>
                        <Typography>
                            {word?.native} <Info word={word}></Info>
                        </Typography>
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
                        <Button onClick={help}>
                            Hint with one letter (ctrl + h)
                        </Button>
                        <Button onClick={idk}>I don't know (ctrl + i)</Button>
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
