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
import { db } from '../utils/db'

export const LearnPage = () => {
    const [word, setWord] = useState<Word | null>(null)
    const [mistake, setMistake] = useState<Word | null>(null)

    const [translations, setTranslations] = useState<string[]>([])

    const [countWords] = useLS(lsConf.count_words)
    const [translationLang] = useLS(lsConf.translationLang)
    const [nativeLang] = useLS(lsConf.nativeLang)
    const [learnFirst] = useLS(lsConf.learn_first)

    const updater = useUpdateProgress(word)

    const generate = useCallback(async () => {
        let wordsToLearn = await db.words
            .where('progress')
            .below(1)
            .sortBy('id')

        if (learnFirst > 0) {
            wordsToLearn = _.slice(wordsToLearn, 0, learnFirst)
        }

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
    }, [countWords, learnFirst])

    const compare = useCallback(
        async (translation?: string) => {
            if (!word) return

            if (word.translation === translation) {
                await updater?.success()
            } else {
                setMistake(word)
                await updater?.fail()
            }

            generate()
        },
        [word, generate, updater]
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
            <Dialog onClose={() => setMistake(null)} open={!!mistake}>
                <DialogTitle>
                    {mistake?.native} - {mistake?.translation}
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
