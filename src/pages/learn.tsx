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
import { Word } from '../types/word'
import { getRandomValueFromArray } from '../utils'
import { db } from '../utils/db'

export const LearnPage = () => {
    const [native, setNative] = useState('')
    const [mistake, setMistake] = useState<Word | null>(null)

    const [translations, setTranslations] = useState<string[]>([])

    const [countWords] = useLocalStorageState('count_words', {
        defaultValue: 5,
    })
    const [successOffset] = useLocalStorageState('success_offset', {
        defaultValue: 0.05,
    })
    const [mistakeOffset] = useLocalStorageState('mistake_offset', {
        defaultValue: 0.5,
    })

    const generate = useCallback(async () => {
        const words = await db.words.toArray()
        const preparedWords = _.slice(
            _.shuffle(words.filter((w) => w.progress < 1)),
            0,
            countWords
        )
        const randomWord = getRandomValueFromArray(preparedWords)

        if (!randomWord) return setTranslations([])

        setNative(randomWord.native)
        setTranslations(preparedWords.map((w) => w.translation))
    }, [countWords])

    const compare = useCallback(
        async (translation?: string) => {
            const words = await db.words.toArray()
            const word = words?.find((w) => w.native === native)

            if (!word) return

            if (word.translation === translation) {
                await db.words.update(word.id || 0, {
                    progress: word.progress + successOffset,
                })
            } else {
                setMistake(word)
                await db.words.update(word.id || 0, {
                    progress: word.progress * mistakeOffset,
                })
            }

            generate()
        },
        [native, generate, successOffset, mistakeOffset]
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
                    <Typography align="center">{native}</Typography>
                </CardContent>
                <CardActions>
                    <Grid container justifyContent="center">
                        {translations.map((t) => (
                            <Grid item key={t}>
                                <Button
                                    color="success"
                                    onClick={() => compare(t)}
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
