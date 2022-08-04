import {
    Button,
    Card,
    CardActions,
    CardContent,
    Grid,
    Typography,
} from '@mui/material'
import _ from 'lodash'
import { useCallback, useEffect, useState } from 'react'
import { Info } from '../components/Info'
import { Nothing } from '../components/Nothing'
import { lsConf } from '../conf'
import { useLS } from '../hooks/useLS'
import { Word } from '../types/word'
import { getRandomValueFromArray, sayNative, sayTranslation } from '../utils'
import { db, getWords } from '../utils/db'

export const ControlWorkPage = () => {
    const [checkedWords, setCheckedWords] = useState<number[]>([])
    const [word, setWord] = useState<Word | null>(null)

    const [showTranslations, setShowTranslations] = useState(false)
    const [translations, setTranslations] = useState<string[]>([])

    const [countWords] = useLS(lsConf.count_words)

    const generate = useCallback(async () => {
        const checkedSet = new Set(checkedWords)

        const words = await getWords()

        const variants = words.filter((word) => {
            if (!word.id) return false
            if (word.progress < 1) return false
            if (checkedSet.has(word.id)) return false
            return true
        })

        const preparedWords = _.slice(_.shuffle(variants), 0, countWords)

        const randomWord = getRandomValueFromArray(preparedWords)
        if (!randomWord) return setWord(null)
        setWord(randomWord)

        setTranslations(_.shuffle(preparedWords.map((w) => w.translation)))
    }, [countWords, checkedWords])

    const compare = useCallback(
        async (translation?: string) => {
            const id = word?.id
            if (!id) return

            if (word.translation !== translation) {
                await db.words.update(word, { progress: 0 })
            }

            setCheckedWords((o) => [...o, id])

            setShowTranslations(false)
        },
        [word]
    )

    useEffect(() => {
        generate()
    }, [generate])

    if (!word) return <Nothing />

    return (
        <>
            <Card>
                <CardContent>
                    <Typography
                        align="center"
                        onMouseEnter={() => sayNative(word?.native || '')}
                        onMouseLeave={() => window.speechSynthesis.cancel()}
                    >
                        {word?.native || ''} <Info word={word}></Info>
                    </Typography>
                </CardContent>
                {showTranslations && (
                    <CardActions>
                        <Grid container justifyContent="center">
                            {translations.map((t) => (
                                <Grid item key={t}>
                                    <Button
                                        color="success"
                                        onClick={() => compare(t)}
                                        onMouseEnter={() => sayTranslation(t)}
                                        onMouseLeave={() =>
                                            window.speechSynthesis.cancel()
                                        }
                                    >
                                        {t}
                                    </Button>
                                </Grid>
                            ))}
                        </Grid>
                    </CardActions>
                )}
                <CardActions>
                    <Button color="error" onClick={() => compare()}>
                        I don't know
                    </Button>
                    <Button
                        color="success"
                        onClick={() => setShowTranslations(true)}
                    >
                        I know
                    </Button>
                </CardActions>
            </Card>
        </>
    )
}
