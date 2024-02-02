import _ from 'lodash'
import { useCallback, useEffect, useState } from 'react'
import { Card, Cards } from '../../components/Card'
import {
    Button,
    ButtonGroup,
    CardActions,
    CardContent,
    Checkbox,
    FormControlLabel,
    Snackbar,
    TextField,
    Typography,
} from '@mui/material'
import { useLS } from '../../hooks/useLS'
import { lsConf } from '../../conf'
import { getRandomValueFromArray, say } from '../../utils'
import { useLangs } from '../../hooks/useLangs'
import { useAppContext } from '../../ctx/app'
import styles from './numbers.module.scss'
import { Form } from '../../components/Form'

export const NumbersLearnComponent = () => {
    const [variants, setVariants] = useState<number[]>([])
    const [generatedNumber, setGeneratedNumber] = useState<number>()
    const [min, setMin] = useLS(lsConf.numbersGeneratorMin)
    const [max, setMax] = useLS(lsConf.numbersGeneratorMax)
    const [numbersCount] = useLS(lsConf.count_words)
    const [floating, setFloating] = useState(false)
    const [reverse, setReverse] = useState(false)

    const [writeStyle, setWriteStyle] = useState(false)
    const [writeStyleValue, setWriteStyleValue] = useState<number>()

    const [mistake, setMistake] = useState<number>()
    const [showMistake, setShowMistake] = useState(false)

    const { nativeLang: baseNativeLang, translationLang: BaseTranslationLang } =
        useAppContext()
    const { translationLang } = useLangs(reverse)

    const generate = useCallback(() => {
        window.speechSynthesis.cancel()
        const numbers = new Array(numbersCount)
            .fill('')
            .map(() => _.round(_.random(min, max, floating), 2))
        const number = getRandomValueFromArray(numbers)
        setVariants(numbers)
        setGeneratedNumber(number)
        setWriteStyleValue(undefined)
        say(number.toString(), translationLang?.voiceURI)
    }, [min, max, floating, translationLang?.voiceURI, numbersCount])

    const didMistake = () => {
        setMistake(generatedNumber)
        setShowMistake(true)
        generate()
    }

    const compare = (value: number) => {
        if (generatedNumber !== value) return didMistake()
        generate()
    }

    const checkWrited = () => {
        if (writeStyleValue !== generatedNumber) return didMistake()
        generate()
    }

    useEffect(() => {
        generate()
    }, [generate])

    useEffect(() => {
        return () => window.speechSynthesis.cancel()
    }, [])

    if (!baseNativeLang?.voiceURI && !BaseTranslationLang?.voiceURI)
        return (
            <Card>
                <CardContent>
                    <Typography>
                        {
                            "Not found voice URI. Go to the settings -> collections -> fill 'Native language' or 'Translation language' selects to activate this page"
                        }
                    </Typography>
                </CardContent>
            </Card>
        )

    return (
        <>
            <Snackbar
                open={showMistake}
                onClose={() => setShowMistake(false)}
                message={mistake}
                autoHideDuration={2000}
            />
            <Cards>
                <Card>
                    {writeStyle ? (
                        <Form onSubmit={checkWrited}>
                            <CardContent>
                                <TextField
                                    fullWidth
                                    value={writeStyleValue || ''}
                                    onChange={(e) =>
                                        setWriteStyleValue(+e.target.value)
                                    }
                                    type="number"
                                    label="What did you hear?"
                                />
                            </CardContent>
                            <CardActions>
                                <Button type="submit">check</Button>
                            </CardActions>
                        </Form>
                    ) : (
                        <CardActions className={styles.variants}>
                            {variants.map((variant, i) => (
                                <Button
                                    key={i}
                                    onClick={() => compare(variant)}
                                >
                                    {variant}
                                </Button>
                            ))}
                        </CardActions>
                    )}
                </Card>
                <Card>
                    <CardContent className={styles.settings}>
                        <ButtonGroup>
                            <Button
                                variant={!reverse ? 'contained' : 'outlined'}
                                onClick={() => setReverse(false)}
                            >
                                {BaseTranslationLang?.name}
                            </Button>
                            <Button
                                variant={reverse ? 'contained' : 'outlined'}
                                onClick={() => setReverse(true)}
                            >
                                {baseNativeLang?.name}
                            </Button>
                        </ButtonGroup>
                        <TextField
                            variant="standard"
                            value={min}
                            type="number"
                            onChange={(e) => setMin(+e.target.value)}
                            label="Min"
                        />
                        <TextField
                            variant="standard"
                            value={max}
                            type="number"
                            onChange={(e) => setMax(+e.target.value)}
                            label="Max"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    value={writeStyle}
                                    onChange={() => setWriteStyle((o) => !o)}
                                />
                            }
                            label="Write style learning"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    value={floating}
                                    onChange={() => setFloating((o) => !o)}
                                />
                            }
                            label="Floating"
                        />
                    </CardContent>
                </Card>
            </Cards>
        </>
    )
}
