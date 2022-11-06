import { Button, CardActions, CardContent, Typography } from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import { Card } from '../components/hoc/Card'
import { Nothing } from '../components/Nothing'
import { lsConf } from '../conf'
import { useLS } from '../hooks/useLS'
import { Word } from '../types/word'
import { getRandomValueFromArray, sayNative, sayTranslation } from '../utils'
import { composeWords } from '../utils/db'

export const ListenPage = () => {
    const [playing, setPlaying] = useState(false)
    const [current, setCurrent] = useState<Word | null>(null)
    const [prev, setPrev] = useState<Word | null>(null)
    const [learnFirst] = useLS(lsConf.learn_first)

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
        sayNative(current.native)
        sayTranslation(current.translation)
        const id = setInterval(() => {
            if (window.speechSynthesis.speaking) return
            setPrev(current)
        }, 100)
        return () => clearInterval(id)
    }, [playing, current])

    if (!current) return <Nothing />

    return (
        <Card>
            <CardContent>
                <Typography>
                    {current.native} - {current.translation}
                </Typography>
            </CardContent>
            <CardActions>
                <Button onClick={() => setPlaying((o) => !o)}>
                    {playing ? 'Stop' : 'Listen'}
                </Button>
            </CardActions>
        </Card>
    )
}
