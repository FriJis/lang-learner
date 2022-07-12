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
import { config } from '../conf'
import { Word } from '../types/word'
import { getRandomValueFromArray } from '../utils'
import { db } from '../utils/db'

export const LearnPage = () => {
    const [native, setNative] = useState('')
    const [mistake, setMistake] = useState<Word | null>(null)

    const [translations, setTranslations] = useState<string[]>([])

    const generate = useCallback(async () => {
        const words = await db.words.toArray()
        const preparedWords = _.slice(
            _.shuffle(words.filter((w) => w.progress < 1)),
            0,
            config.maxWords
        )
        const randomWord = getRandomValueFromArray(preparedWords)

        if (!randomWord) return setTranslations([])

        setNative(randomWord.native)
        setTranslations(preparedWords.map((w) => w.translation))
    }, [])

    const compare = useCallback(
        async (translation?: string) => {
            const words = await db.words.toArray()
            const word = words?.find((w) => w.native === native)

            if (!word) return

            if (word.translation === translation) {
                await db.words.update(word.id || 0, {
                    progress: word.progress + config.successPlus,
                })
            } else {
                setMistake(word)
                await db.words.update(word.id || 0, {
                    progress: word.progress / config.mistakeOffset,
                })
            }

            generate()
        },
        [native, generate]
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
