import {
    Button,
    CardActions,
    CardContent,
    Checkbox,
    FormControlLabel,
    FormGroup,
    Grid,
    Typography,
} from '@mui/material'
import { FC, ReactNode, useEffect, useState } from 'react'
import { Word } from '../types/word'
import { sayNative, sayTranslation } from '../utils'
import { Card, Cards } from './Card'
import { Info } from './Info'

export const Quiz: FC<{
    answerOptions: Word[]
    currentWord: Word
    onFail: () => void
    onSuccess: () => void
    beforeWord?: ReactNode
}> = ({ answerOptions, currentWord, onFail, onSuccess, beforeWord }) => {
    const [showTranslations, setShowTranslations] = useState(false)
    const [reverse, setReverse] = useState(false)
    const [langSwitching, setLangSwitching] = useState(true)
    const [hide, setHide] = useState(false)

    useEffect(() => {
        if (!langSwitching) return setReverse(false)
        setReverse((o) => !o)
    }, [langSwitching, currentWord])

    const success = () => {
        setShowTranslations(false)
        onSuccess()
    }

    const fail = () => {
        setShowTranslations(false)
        onFail()
    }

    return (
        <Cards>
            <Card>
                <CardContent>
                    {beforeWord}
                    <Typography
                        align="center"
                        onMouseEnter={() =>
                            reverse
                                ? sayTranslation(currentWord?.translation || '')
                                : sayNative(currentWord?.native || '')
                        }
                        onMouseLeave={() => window.speechSynthesis.cancel()}
                    >
                        {reverse
                            ? currentWord?.translation
                            : currentWord?.native || ''}{' '}
                        {!!currentWord?.info && (
                            <Info word={currentWord}></Info>
                        )}
                    </Typography>
                </CardContent>
                {(!hide || showTranslations) && (
                    <CardActions>
                        <Grid container justifyContent="center">
                            {answerOptions.map((t) => (
                                <Grid item key={t.id}>
                                    <Button
                                        color="success"
                                        onClick={() =>
                                            t.id === currentWord.id
                                                ? success()
                                                : fail()
                                        }
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
                )}
                <CardActions>
                    <Button color="error" onClick={fail}>
                        I don't know
                    </Button>
                    {hide && !showTranslations && (
                        <Button
                            color="success"
                            onClick={() => setShowTranslations(true)}
                        >
                            I know
                        </Button>
                    )}
                </CardActions>
            </Card>
            <Card>
                <CardContent>
                    <FormGroup>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    defaultChecked
                                    value={langSwitching}
                                    onChange={() => setLangSwitching((o) => !o)}
                                />
                            }
                            label="Real-time language switching"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    value={hide}
                                    onChange={() => setHide((o) => !o)}
                                />
                            }
                            label="Hide the results of responses"
                        />
                    </FormGroup>
                </CardContent>
            </Card>
        </Cards>
    )
}
