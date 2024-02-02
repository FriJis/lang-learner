import { Dialog, DialogTitle } from '@mui/material'
import _ from 'lodash'
import { useCallback, useEffect, useState } from 'react'
import { Nothing } from '../../components/Nothing'
import { lsConf } from '../../conf'
import { useLS } from '../../hooks/useLS'
import { useUpdateProgress } from '../../hooks/useUpdateProgress'
import { Word } from '../../types/word'
import { getRandomValueFromArray, sayNative, sayTranslation } from '../../utils'
import { composeWords } from '../../utils/db'
import { Quiz } from '../../components/Quiz'

export const LearnComponent = () => {
    const [ready, setReady] = useState(false)

    const [word, setWord] = useState<Word | null>(null)
    const [prev, setPrev] = useState<Word | null>(null)
    const [showPrev, setShowPrev] = useState(false)

    const [translations, setTranslations] = useState<Word[]>([])

    const [countWords] = useLS(lsConf.count_words)
    const [learnFirst] = useLS(lsConf.learn_first)

    const updater = useUpdateProgress(word)

    const generate = useCallback(async () => {
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

    const success = async () => {
        if (!word) return
        await updater?.success()
        setPrev(word)
    }

    const fail = async () => {
        if (!word) return
        sayNative(word.native)
        sayTranslation(word.translation)
        setShowPrev(true)
        await updater?.fail()

        setPrev(word)
    }

    useEffect(() => {
        generate().then(() => setReady(true))
    }, [generate])

    if (!ready) return null

    if (!word) return <Nothing />

    return (
        <>
            <Dialog onClose={() => setShowPrev(false)} open={showPrev}>
                <DialogTitle>
                    {prev?.native} - {prev?.translation}{' '}
                    {!!prev?.info ? `(${prev.info})` : ''}
                </DialogTitle>
            </Dialog>
            <Quiz
                currentWord={word}
                answerOptions={translations}
                onFail={fail}
                onSuccess={success}
            />
        </>
    )
}
