import { Typography } from '@mui/material'
import _ from 'lodash'
import moment from 'moment'
import { useCallback, useEffect, useState } from 'react'
import { Nothing } from '../../components/Nothing'
import { lsConf } from '../../conf'
import { useLS } from '../../hooks/useLS'
import { StatisticsType } from '../../types/statistics'
import { Word } from '../../types/word'
import { getRandomValueFromArray } from '../../utils'
import { db, getWords } from '../../utils/db'
import { useAppContext } from '../../ctx/app'
import { Quiz } from '../../components/Quiz'

export const ControlWorkComponent = () => {
    const [ready, setReady] = useState(false)

    const [checkedWords, setCheckedWords] = useState<number[]>([])
    const [word, setWord] = useState<Word | null>(null)
    const [sessionWords, setSessionWords] = useState<Word[]>([])

    const [translations, setTranslations] = useState<Word[]>([])

    const [countWords] = useLS(lsConf.count_words)
    const [controlWorkTimer] = useLS(lsConf.control_work_timer)
    const [maxContinuouslyPassedTests] = useLS(
        lsConf.maxContinuouslyPassedTests
    )
    const { collection } = useAppContext()

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

        setTranslations(_.shuffle(preparedWords))
    }, [countWords, checkedWords, sessionWords])

    const fail = () => {
        const id = word?.id
        if (!id) return
        db.words.update(word, {
            progress: 0,
            lastControllWork: moment().toISOString(),
            continuouslyPassedTests: 0,
        })
        setCheckedWords((o) => [...o, id])
    }

    const success = () => {
        const id = word?.id
        if (!id) return
        db.words.update(word, {
            lastControllWork: moment().toISOString(),
            continuouslyPassedTests: (word.continuouslyPassedTests || 0) + 1,
        })
        const collectionId = collection?.id
        if (!collectionId) throw new Error('collection is undefined')

        db.statistics.add({
            type: StatisticsType.passedFinalTest,
            metaValue: `${word.native} - ${word.translation}`,
            createdAt: moment.utc().toISOString(),
            collectionId,
        })
        setCheckedWords((o) => [...o, id])
    }

    useEffect(() => {
        generate().then(() => setReady(true))
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
                    if (
                        (word.continuouslyPassedTests || 0) >=
                        maxContinuouslyPassedTests
                    )
                        return false
                    return true
                })
            )
        }
        f()
    }, [controlWorkTimer, maxContinuouslyPassedTests])

    if (!ready) return null

    if (!word) return <Nothing />

    return (
        <Quiz
            currentWord={word}
            answerOptions={translations}
            onFail={fail}
            beforeWord={
                <Typography align="center">
                    {`${checkedWords.length} / ${sessionWords.length}`}
                </Typography>
            }
            onSuccess={success}
        />
    )
}
