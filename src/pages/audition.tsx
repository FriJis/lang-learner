import {
    Button,
    CardActions,
    CardContent,
    Slider,
    TextField,
    Typography,
} from '@mui/material'
import _ from 'lodash'
import { useCallback, useMemo, useState } from 'react'
import { Card } from '../components/hoc/Card'
import { ReverseLangs } from '../components/Reverse'
import { lsConf } from '../conf'
import { useLangs } from '../hooks/useLangs'
import { useLS } from '../hooks/useLS'
import { say } from '../utils'

export const AuditionPage = () => {
    const [reverse, setReverse] = useState(true)
    const [originText, setOriginText] = useState('')
    const [userText, setUserText] = useState('')
    const [userResults, setUserResults] = useState<string[]>([])
    const [preparedText, setPreparedText] = useState<string[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [finished, setFinished] = useState(false)
    const currentPreparedText = useMemo(
        () => preparedText[currentIndex],
        [preparedText, currentIndex]
    )
    const nextPreparedText = useMemo(
        () => preparedText[currentIndex + 1],
        [preparedText, currentIndex]
    )

    const [speakRate, setSpeakRate] = useLS(lsConf.speakRate)

    const langs = useLangs(reverse)

    const [started, setStarted] = useState(false)

    const start = useCallback(() => {
        setCurrentIndex(0)
        setPreparedText(
            // eslint-disable-next-line
            _.compact(originText.split(/\. |\!|\"|\”|\(|\)|\n|\。/))
        )
        setFinished(false)
        setUserText('')
        setStarted(true)
        setUserResults([])
    }, [originText])

    const speak = useCallback(() => {
        window.speechSynthesis.cancel()
        say(currentPreparedText, langs.native.key)
    }, [currentPreparedText, langs])

    const save = useCallback(() => {
        setUserResults((o) => [...o, userText])
        setUserText('')
    }, [userText])

    const next = useCallback(() => {
        setCurrentIndex((o) => o + 1)
        window.speechSynthesis.cancel()
        say(nextPreparedText, langs.native.key)
        save()
    }, [nextPreparedText, langs.native.key, save])

    const finish = useCallback(() => {
        window.speechSynthesis.cancel()
        setFinished(true)
        setStarted(false)
        save()
    }, [save])

    return (
        <Card>
            <CardContent>
                <ReverseLangs
                    reverse={reverse}
                    setReverse={setReverse}
                ></ReverseLangs>
            </CardContent>
            <CardContent>
                <Typography>Synthesis speed {speakRate}</Typography>
                <Slider
                    min={0.5}
                    max={2}
                    step={0.1}
                    value={speakRate}
                    onChange={(e, v) => setSpeakRate(_.isArray(v) ? v[0] : v)}
                ></Slider>
            </CardContent>
            {!started ? (
                <>
                    <CardContent>
                        <TextField
                            label="Text"
                            maxRows={5}
                            multiline
                            fullWidth
                            value={originText}
                            onChange={(e) => setOriginText(e.target.value)}
                        ></TextField>
                    </CardContent>
                    <CardActions>
                        <Button
                            onClick={start}
                            disabled={originText.length <= 0}
                        >
                            Start
                        </Button>
                    </CardActions>
                </>
            ) : (
                <>
                    <CardContent>
                        <TextField
                            label="Repeat text"
                            maxRows={10}
                            multiline
                            fullWidth
                            value={userText}
                            onChange={(e) => setUserText(e.target.value)}
                        ></TextField>
                    </CardContent>
                    <CardActions>
                        <Button onClick={speak}>Listen</Button>
                        {nextPreparedText ? (
                            <Button onClick={next}>Next</Button>
                        ) : (
                            <Button onClick={finish}>Finish</Button>
                        )}
                    </CardActions>
                </>
            )}
            {finished && (
                <>
                    <CardContent>
                        {preparedText.map((text, i) => (
                            <Typography key={i}>
                                {i + 1}){text}
                            </Typography>
                        ))}
                    </CardContent>
                    <CardContent>
                        {userResults.map((text, i) => (
                            <Typography key={i}>
                                {i + 1}){text}
                            </Typography>
                        ))}
                    </CardContent>
                </>
            )}
        </Card>
    )
}
