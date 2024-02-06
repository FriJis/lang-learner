import {
    Button,
    CardActions,
    CardContent,
    Input,
    Snackbar,
    Typography,
} from '@mui/material'
import {
    ChangeEvent,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react'
import { Word } from '../../types/word'
import { getRandomValueFromArray, sayNative, sayTranslation } from '../../utils'
import { composeWords } from '../../utils/db'
import { compareTwoStrings } from 'string-similarity'
import { useUpdateProgress } from '../../hooks/useUpdateProgress'
import { Form } from '../../components/Form'
import { usePressBtn } from '../../hooks/usePressBtn'
import { lsConf } from '../../conf'
import { useLS } from '../../hooks/useLS'
import { Nothing } from '../../components/Nothing'
import { Info } from '../../components/Info'
import { Card } from '../../components/Card'

export const WriteComponent = () => {
    const [ready, setReady] = useState(false)

    const [word, setWord] = useState<Word | null>(null)
    const [result, setResult] = useState('')
    const [helperIndex, setHelperIndex] = useState(0)

    const [showPrev, setShowPrev] = useState(false)
    const [prev, setPrev] = useState<Word | null>(null)

    const [learnFirst] = useLS(lsConf.learn_first)

    const inputRef = useRef<HTMLInputElement>(null)

    const helper = useMemo(
        () => word?.translation.slice(0, helperIndex),
        [helperIndex, word]
    )

    const generate = useCallback(async () => {
        const words = await composeWords({
            learnFirst,
            prev: prev || undefined,
        })
        const word = getRandomValueFromArray(words)
        if (!word) return
        setResult('')
        setHelperIndex(0)
        setWord(word)
    }, [learnFirst, prev])

    const updater = useUpdateProgress(word)

    const compare = async (result: string) => {
        if (!word) return
        const compared = compareTwoStrings(word.translation || '', result)
        const hintRatio = 1 - helperIndex

        if (hintRatio >= 1) {
            await updater.success(compared)
        } else if (hintRatio <= -1) {
            await updater.fail()
        }

        setPrev(word)
        sayNative(word.native)
        sayTranslation(word.translation)
    }

    const help = useCallback(() => {
        if (!word) return
        setHelperIndex((currentIndex) => {
            const nextIndex = currentIndex + 1
            inputRef.current?.click()

            if (nextIndex >= word.translation.length - 1) {
                updater.fail()
                sayNative(word.native)
                sayTranslation(word.translation)
                setPrev(word)
                return 0
            }
            return nextIndex
        })
    }, [word, inputRef, updater])

    const idk = useCallback(() => {
        if (!word) return
        setPrev(word)
        sayNative(word.native)
        sayTranslation(word.translation)
        updater.fail()
        generate()
        inputRef.current?.click()
    }, [word, generate, updater, inputRef])

    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target
        if (value === word?.translation) {
            return compare(value)
        }
        setResult(e.target.value)
    }

    useEffect(() => {
        if (!prev) return
        setShowPrev(true)
        return () => setShowPrev(false)
    }, [prev])

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
        generate().then(() => setReady(true))
    }, [generate])

    if (!ready) return null

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
            />
            <Form onSubmit={() => compare(result)}>
                <Card>
                    <CardContent>
                        <Typography>
                            {word?.native} <Info word={word}></Info>
                        </Typography>
                        {helperIndex > 0 && (
                            <Typography color={'gray'}>
                                Hint: {helper || ''}
                            </Typography>
                        )}
                        <Input
                            ref={inputRef}
                            value={result}
                            placeholder="Translation..."
                            onChange={onChange}
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
