import {
    Button,
    CardActions,
    CardContent,
    Grid,
    Typography,
} from '@mui/material'
import _ from 'lodash'
import moment from 'moment'
import { useCallback, useEffect, useState } from 'react'
import { Card } from '../components/hoc/Card'
import { Info } from '../components/Info'
import { Nothing } from '../components/Nothing'
import { lsConf } from '../conf'
import { useLS } from '../hooks/useLS'
import { StatisticsType } from '../types/statistics'
import { Word } from '../types/word'
import { getRandomValueFromArray, sayNative, sayTranslation } from '../utils'
import { db, getCollection, getWords } from '../utils/db'

export const ControlWorkPage = () => {
    const [checkedWords, setCheckedWords] = useState<number[]>([])
    const [word, setWord] = useState<Word | null>(null)
    const [sessionWords, setSessionWords] = useState<Word[]>([])

    const [showTranslations, setShowTranslations] = useState(false)
    const [translations, setTranslations] = useState<string[]>([])

    const [countWords] = useLS(lsConf.count_words)
    const [controlWorkTimer] = useLS(lsConf.control_work_timer)

    const generate = useCallback(async () => {
        const checkedSet = new Set(checkedWords)

        const variants = sessionWords.filter((word) => {
            if (!word.id) return false
            if (checkedSet.has(word.id)) return false
            return true
        })

        const preparedWords = _.slice(_.shuffle(variants), 0, countWords)

        const randomWord = getRandomValueFromArray(preparedWords)
        if (!randomWord) return setWord(null)
        setWord(randomWord)

        setTranslations(_.shuffle(preparedWords.map((w) => w.translation)))
    }, [countWords, checkedWords, sessionWords])

    const compare = useCallback(
        async (translation?: string) => {
            const id = word?.id
            if (!id) return

            await db.transaction(
                'rw',
                db.words,
                db.collections,
                db.statistics,
                async () => {
                    if (word.translation !== translation) {
                        await db.words.update(word, { progress: 0 })
                    } else {
                        const collection = await getCollection()
                        const collectionId = collection?.id
                        if (!collectionId)
                            throw new Error('collection is undefined')

                        await db.statistics.add({
                            type: StatisticsType.passedFinalTest,
                            metaValue: `${word.native} - ${word.translation}`,
                            createdAt: moment.utc().toISOString(),
                            collectionId,
                        })
                    }
                    await db.words.update(word, {
                        lastControllWork: moment().toISOString(),
                    })
                    setCheckedWords((o) => [...o, id])
                }
            )

            setShowTranslations(false)
        },
        [word]
    )

    useEffect(() => {
        generate()
    }, [generate])

    useEffect(() => {
        const f = async () => {
            const words = await getWords()
            setSessionWords(
                words.filter((word) => {
                    if (word.progress < 1) return false
                    if (_.isUndefined(word.lastControllWork)) return true
                    if (
                        moment().diff(moment(word.lastControllWork), 'days') <
                        controlWorkTimer
                    )
                        return false
                    return true
                })
            )
        }
        f()
    }, [controlWorkTimer])

    if (!word) return <Nothing />

    return (
        <>
            <Card>
                <CardContent>
                    <Typography align="center">
                        {`${checkedWords.length} / ${sessionWords.length}`}
                    </Typography>
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
