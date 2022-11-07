import { Button, CardActions, CardContent } from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import { Card } from '../components/hoc/Card'
import { lsConf } from '../conf'
import { useLS } from '../hooks/useLS'
import { useRecognation } from '../hooks/useRecognation'
import { Word } from '../types/word'
import { getRandomValueFromArray } from '../utils'
import { composeWords, getWords } from '../utils/db'
import SpeechRecognition, {
    useSpeechRecognition,
} from 'react-speech-recognition'
import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo } from 'react'

export const WordAuditionPage = () => {
    const [prev, setPrev] = useState<Word | null>(null)
    const [started, setStarted] = useState(false)
    const [word, setWord] = useState<Word | null>(null)
    const allWords = useLiveQuery(() => getWords())
    const mappedAllWords = useMemo(
        () => allWords?.map((word) => word.translation) || [],
        [allWords]
    )
    const [learnFirst] = useLS(lsConf.learn_first)

    const { browserSupportsSpeechRecognition } = useSpeechRecognition()

    const generate = useCallback(async () => {
        const words = await composeWords({
            learnFirst,
            prev: prev || undefined,
        })
        const word = getRandomValueFromArray(words)
        if (!word) return
        setWord(word)
    }, [learnFirst, prev])

    useEffect(() => {
        generate()
    }, [generate])

    const recFn = useCallback(
        (text: string) => {
            console.log(text)
            setPrev(word)
        },
        [word]
    )

    useRecognation(started, mappedAllWords, recFn)

    if (!browserSupportsSpeechRecognition)
        return (
            <Card>
                <CardContent>
                    Your browser doesn't support speech recognition
                </CardContent>
            </Card>
        )

    return (
        <Card>
            <CardContent>{word?.native}</CardContent>
            <CardActions>
                <Button onClick={() => setStarted((o) => !o)}>Start</Button>
            </CardActions>
        </Card>
    )
}
