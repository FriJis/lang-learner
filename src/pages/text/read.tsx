import {
    Button,
    CardActions,
    CardContent,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material'
import _ from 'lodash'
import { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { ReverseLangs } from '../../components/Reverse'
import { useLangs } from '../../hooks/useLangs'
import { Word as IWord } from '../../types/word'
import { normalize, say } from '../../utils'
import { PopoverHelper } from '../../components/PopoverHelper'
import { useAppContext } from '../../ctx/app'
import { Card, Cards } from '../../components/Card'

export const ReadComponent = () => {
    const [reverse, setReverse] = useState(true)
    const [text, setText] = useState('')

    const { words } = useAppContext()

    const getCurrentWords = useCallback(
        (w: IWord) => {
            const native = reverse ? w.translation : w.native
            const translation = !reverse ? w.translation : w.native
            return { native, translation }
        },
        [reverse]
    )

    const preparedText = useMemo(() => {
        const letterPattern = 'usdybfiuxweryitchjxgwuytxewurftxeruvytu'
        const makeRegExp = (w: string) => new RegExp(_.escapeRegExp(w), 'gim')

        return _.sortBy(words, (w) => getCurrentWords(w).native.length)
            .reverse()
            .reduce<string>((text, word) => {
                const { native } = getCurrentWords(word)
                const regEx = makeRegExp(native)
                return text.replace(
                    regEx,
                    `<<${native.split('').join(letterPattern)}>>`
                )
            }, text)
            .replace(new RegExp(letterPattern, 'gim'), '')
            .split(/<<|>>/)
    }, [text, words, getCurrentWords])

    const { nativeLang } = useLangs(reverse)

    const listen = useCallback(() => {
        if (window.speechSynthesis.speaking)
            return window.speechSynthesis.cancel()
        say(text, nativeLang?.key)
    }, [text, nativeLang])

    const pause = useCallback(() => {
        if (window.speechSynthesis.paused)
            return window.speechSynthesis.resume()
        window.speechSynthesis.pause()
    }, [])

    useEffect(() => {
        return () => window.speechSynthesis.cancel()
    }, [])

    return (
        <Cards>
            <Card>
                <CardContent>
                    <ReverseLangs reverse={reverse} setReverse={setReverse} />
                    <TextField
                        maxRows={5}
                        multiline
                        fullWidth
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    ></TextField>
                </CardContent>
                <CardActions>
                    <Button onClick={listen}>listen\stop</Button>
                    <Button onClick={pause}>resume\pause</Button>
                </CardActions>
                <CardContent>
                    <Typography variant="h5" align="center">
                        Select the text or words below to see translation.
                    </Typography>
                </CardContent>
                <CardContent>
                    <PopoverHelper reverse={reverse}>
                        <Typography component="pre" whiteSpace={'pre-wrap'}>
                            {preparedText.map((pr, i) => (
                                <Word
                                    words={words || []}
                                    word={pr}
                                    key={i}
                                ></Word>
                            ))}
                        </Typography>
                    </PopoverHelper>
                </CardContent>
            </Card>
        </Cards>
    )
}

const Word: FC<{
    word: string
    words: IWord[]
}> = ({ word, words }) => {
    const translation = useMemo(() => {
        const found = words.find(
            (w) =>
                normalize(w.native) === normalize(word) ||
                normalize(w.translation) === normalize(word)
        )
        if (!found) return

        return {
            translation:
                normalize(found.native) === normalize(word)
                    ? found.translation
                    : found.native,
            progress: found.progress,
        }
    }, [word, words])

    if (!translation) return <span>{word}</span>
    return (
        <Tooltip title={translation.translation}>
            <span
                style={{
                    backgroundColor:
                        translation.progress >= 1 ? 'wheat' : 'pink',
                }}
            >
                {word}
            </span>
        </Tooltip>
    )
}
