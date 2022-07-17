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
import useLocalStorageState from 'use-local-storage-state'
import { lsConf } from '../conf'
import { useUpdateProgress } from '../hooks/useUpdateProgress'
import { Word } from '../types/word'
import { getRandomValueFromArray, say } from '../utils'
import { db } from '../utils/db'

export const LearnPage = () => {
    const [word, setWord] = useState<Word | null>(null)
    const [mistake, setMistake] = useState<Word | null>(null)

    const [translations, setTranslations] = useState<string[]>([])

    const [countWords] = useLocalStorageState(lsConf.count_words.name, {
        defaultValue: lsConf.count_words.def,
    })

    const [translationLang] = useLocalStorageState(
        lsConf.translationLang.name,
        {
            defaultValue: lsConf.translationLang.def,
        }
    )
    const [nativeLang] = useLocalStorageState(lsConf.nativeLang.name, {
        defaultValue: lsConf.nativeLang.def,
    })

    const updater = useUpdateProgress(word)

    const generate = useCallback(async () => {
        const words = await db.words.toArray()
        const preparedWords = _.slice(
            _.shuffle(words.filter((w) => w.progress < 1)),
            0,
            countWords
        )
        const randomWord = getRandomValueFromArray(preparedWords)

        if (!randomWord) return setTranslations([])

        setWord(randomWord)
        setTranslations(preparedWords.map((w) => w.translation))
    }, [countWords])

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
