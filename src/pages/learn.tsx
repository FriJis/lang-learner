import {
    Button,
    CardActions,
    CardContent,
    Checkbox,
    Dialog,
    DialogTitle,
    FormControlLabel,
    FormGroup,
    Grid,
    Typography,
} from '@mui/material'
import _ from 'lodash'
import { useCallback, useEffect, useState } from 'react'
import { Card } from '../components/hoc/Card'
import { Info } from '../components/Info'
import { Nothing } from '../components/Nothing'
import { lsConf } from '../conf'
import { useLS } from '../hooks/useLS'
import { useUpdateProgress } from '../hooks/useUpdateProgress'
import { Word } from '../types/word'
import { getRandomValueFromArray, sayNative, sayTranslation } from '../utils'
import { composeWords } from '../utils/db'

export const LearnPage = () => {
    const [word, setWord] = useState<Word | null>(null)
    const [prev, setPrev] = useState<Word | null>(null)
    const [showPrev, setShowPrev] = useState(false)
    const [langChanging, setLangChanging] = useState(false)
    const [reverse, setReverse] = useState(true)

    const [translations, setTranslations] = useState<Word[]>([])

    const [countWords] = useLS(lsConf.count_words)
    const [learnFirst] = useLS(lsConf.learn_first)

    const updater = useUpdateProgress(word)

    const generate = useCallback(async () => {
        if (_.random(0, 100) <= 50) setReverse((o) => !o)

        const wordsToLearn = await composeWords({
            learnFirst,
            prev: prev || undefined,
        })

        const randomWord = getRandomValueFromArray(wordsToLearn)
        if (!randomWord) return setTranslations([])

        const variants = await composeWords()
        const preparedWords = _.slice(
            _.shuffle(variants.filter((v) => v.id !== randomWord.id)),
            0,
            countWords - 1
        )

        setWord(randomWord)
        setTranslations(_.shuffle([randomWord, ...preparedWords]))
    }, [countWords, learnFirst, prev])

    const compare = useCallback(
        async (translation?: Word) => {
            if (!word) return

            if (word.id === translation?.id) {
                await updater?.success()
                setPrev(word)
                return
            }
            sayNative(word.native)
            sayTranslation(word.translation)
            setShowPrev(true)
            await updater?.fail()

            setPrev(word)
        },
        [word, updater]
    )

    useEffect(() => {
        generate()
    }, [generate])

    if (translations.length <= 0) return <Nothing />

    return (
        <>
            <Dialog onClose={() => setShowPrev(false)} open={showPrev}>
                <DialogTitle>
                    {prev?.native} - {prev?.translation}{' '}
                    {!!prev?.info ? `(${prev.info})` : ''}
                </DialogTitle>
            </Dialog>
            <Card>
                <CardContent>
                    <Typography
                        align="center"
                        onMouseEnter={() =>
                            reverse
                                ? sayTranslation(word?.translation || '')
                                : sayNative(word?.native || '')
                        }
                        onMouseLeave={() => window.speechSynthesis.cancel()}
                    >
                        {reverse ? word?.translation : word?.native || ''}{' '}
                        {!!word?.info && <Info word={word}></Info>}
                    </Typography>
                </CardContent>
                <CardActions>
                    <Grid container justifyContent="center">
                        {translations.map((t) => (
                            <Grid item key={t.id}>
                                <Button
                                    color="success"
                                    onClick={() => compare(t)}
                                    onMouseEnter={() =>
                                        reverse
                                            ? sayNative(t.native)
                                            : sayTranslation(t.translation)
                                    }
                                    onMouseLeave={() =>
                                        window.speechSynthesis.cancel()
                                    }
                                >
                                    {reverse ? t.native : t.translation}
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
            <Card>
                <CardContent>
                    <FormGroup>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    value={langChanging}
                                    onChange={() => setLangChanging((o) => !o)}
                                />
                            }
                            label="Realtime language changing"
                        />
                    </FormGroup>
                </CardContent>
            </Card>
        </>
    )
}
