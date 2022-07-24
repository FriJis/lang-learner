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
import { lsConf } from '../conf'
import { useLS } from '../hooks/useLS'
import { Word } from '../types/word'
import { getRandomValueFromArray, say } from '../utils'
import { db } from '../utils/db'

export const ControlWorkPage = () => {
    const [checkedWords, setCheckedWords] = useState<number[]>([])
    const [word, setWord] = useState<Word | null>(null)

    const [showTranslations, setShowTranslations] = useState(false)
    const [translations, setTranslations] = useState<string[]>([])

    const [countWords] = useLS(lsConf.count_words)
    const [translationLang] = useLS(lsConf.translationLang)
    const [nativeLang] = useLS(lsConf.nativeLang)

    const generate = useCallback(async () => {
        const checkedSet = new Set(checkedWords)

        const words = await db.words.toArray()
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

    if (!word)
        return (
            <Card>
                <CardContent>
                    <Typography align="center">Nothing to learn</Typography>
                </CardContent>
            </Card>
        )

    return (
        <>
            <Card>
                <CardContent>
                    <Typography
                        align="center"
                        onMouseEnter={() => say(word?.native || '', nativeLang)}
                        onMouseLeave={() => window.speechSynthesis.cancel()}
                    >
                        {word?.native || ''}
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
                                        onMouseEnter={() =>
                                            say(t, translationLang)
                                        }
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
