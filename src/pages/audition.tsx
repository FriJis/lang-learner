import {
    Button,
    Card,
    CardActions,
    CardContent,
    Slider,
    TextField,
    Typography,
} from '@mui/material'
import _ from 'lodash'
import { useCallback, useMemo, useState } from 'react'
import { ReverseLangs } from '../components/Reverse'
import { lsConf } from '../conf'
import { useLangs } from '../hooks/useLangs'
import { useLS } from '../hooks/useLS'
import { say } from '../utils'

export const AuditionPage = () => {
    const [reverse, setReverse] = useState(true)
    const [delimiter, setDelimiter] = useState('. ')
    const [originText, setOriginText] = useState('')
    const [userText, setUserText] = useState('')
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

    const started = useMemo(() => preparedText.length > 0, [preparedText])

    const start = useCallback(() => {
        setCurrentIndex(0)
        setPreparedText(originText.split(delimiter))
        setFinished(false)
        setUserText('')
    }, [originText, delimiter])

    const speak = useCallback(() => {
        window.speechSynthesis.cancel()
        say(currentPreparedText, langs.native.key)
    }, [currentPreparedText, langs])

    const next = useCallback(() => {
        setCurrentIndex((o) => o + 1)
        window.speechSynthesis.cancel()
        say(nextPreparedText, langs.native.key)
    }, [nextPreparedText, langs.native.key])

    const finish = useCallback(() => {
        window.speechSynthesis.cancel()
        setPreparedText([])
        setFinished(true)
    }, [])

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
                            label="Delimeter"
                            multiline
                            fullWidth
                            value={delimiter}
                            onChange={(e) => setDelimiter(e.target.value)}
                        ></TextField>
                    </CardContent>
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
                            disabled={
                                originText.length <= 0 || delimiter === ''
                            }
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
                        <Typography>{originText}</Typography>
                    </CardContent>
                    <CardContent>
                        <Typography>{userText}</Typography>
                    </CardContent>
                </>
            )}
        </Card>
    )
}
