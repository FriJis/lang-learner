import {
    Button,
    Card,
    CardActions,
    CardContent,
    Typography,
} from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import { lsConf } from '../conf'
import { useLS } from '../hooks/useLS'
import { Word } from '../types/word'
import { getRandomValueFromArray, say } from '../utils'
import { composeWords } from '../utils/db'

export const ListenPage = () => {
    const [playing, setPlaying] = useState(false)
    const [current, setCurrent] = useState<Word | null>(null)
    const [prev, setPrev] = useState<Word | null>(null)
    const [learnFirst] = useLS(lsConf.learn_first)

    const [nativeLang] = useLS(lsConf.nativeLang)
    const [translationLang] = useLS(lsConf.translationLang)

    const generate = useCallback(async () => {
        const words = await composeWords({
            learnFirst,
            prev: prev || undefined,
        })
        const word = getRandomValueFromArray(words)
        if (!word) return
        setCurrent(word)
    }, [learnFirst, prev])

    useEffect(() => {
        generate()
    }, [generate])

    useEffect(() => {
        if (!current) return
        if (!playing) return
        say(current.native, nativeLang)
        say(current.translation, translationLang)
        const id = setInterval(() => {
            if (window.speechSynthesis.speaking) return
            setPrev(current)
        }, 100)
        return () => clearInterval(id)
    }, [playing, current, nativeLang, translationLang])

    if (!current) return null

    return (
        <Card>
            <CardContent>
                <Typography>
                    {current.native} - {current.translation}
                </Typography>
            </CardContent>
            <CardActions>
                <Button onClick={() => setPlaying((o) => !o)}>listen</Button>
            </CardActions>
        </Card>
    )
}
