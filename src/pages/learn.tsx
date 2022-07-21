import {
    Button,
    Card,
    CardActions,
    CardContent,
    Dialog,
    DialogTitle,
    Grid,
    Typography,
} from '@mui/material'
import _ from 'lodash'
import { useCallback, useEffect, useState } from 'react'
import { lsConf } from '../conf'
import { useLS } from '../hooks/useLS'
import { useUpdateProgress } from '../hooks/useUpdateProgress'
import { Word } from '../types/word'
import { getRandomValueFromArray, say } from '../utils'
import { composeWords, db } from '../utils/db'

export const LearnPage = () => {
    const [word, setWord] = useState<Word | null>(null)
    const [prev, setPrev] = useState<Word | null>(null)
    const [showPrev, setShowPrev] = useState(false)

    const [translations, setTranslations] = useState<string[]>([])

    const [countWords] = useLS(lsConf.count_words)
    const [translationLang] = useLS(lsConf.translationLang)
    const [nativeLang] = useLS(lsConf.nativeLang)
    const [learnFirst] = useLS(lsConf.learn_first)

    const updater = useUpdateProgress(word)

    const generate = useCallback(async () => {
        const wordsToLearn = await composeWords({
            learnFirst,
            prev: prev || undefined,
        })

        const randomWord = getRandomValueFromArray(wordsToLearn)
        if (!randomWord) return setTranslations([])

        const variants = await db.words.where('progress').below(1).toArray()
        const preparedWords = _.slice(
            _.shuffle(variants.filter((v) => v.id !== randomWord.id)),
            0,
            countWords
        )

        setWord(randomWord)
        setTranslations(
            _.shuffle([
                randomWord.translation,
                ...preparedWords.map((w) => w.translation),
            ])
        )
    }, [countWords, learnFirst, prev])

    const compare = useCallback(
        async (translation?: string) => {
            if (!word) return

            if (word.translation === translation) {
                await updater?.success()
            } else {
                say(word.native, nativeLang)
                say(word.translation, translationLang)
                setShowPrev(true)
                await updater?.fail()
            }
            setPrev(word)
        },
        [word, updater, nativeLang, translationLang]
    )

    useEffect(() => {
        generate()
    }, [generate])

    if (translations.length <= 0)
        return (
            <Card>
                <CardContent>
                    <Typography align="center">Nothing to learn</Typography>
                </CardContent>
            </Card>
        )

    return (
        <>
            <Dialog onClose={() => setShowPrev(false)} open={showPrev}>
                <DialogTitle>
                    {prev?.native} - {prev?.translation}
                </DialogTitle>
            </Dialog>
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
                <CardActions>
                    <Grid container justifyContent="center">
                        {translations.map((t) => (
                            <Grid item key={t}>
                                <Button
                                    color="success"
                                    onClick={() => compare(t)}
                                    onMouseEnter={() => say(t, translationLang)}
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
                <CardActions>
                    <Grid container>
                        <Grid item>
                            <Button color="error" onClick={() => compare()}>
                                I don't know
                            </Button>
                        </Grid>
                    </Grid>
                </CardActions>
            </Card>
        </>
    )
}
