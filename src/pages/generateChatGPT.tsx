import {
    Button,
    ButtonGroup,
    CardActions,
    CardContent,
    Checkbox,
    FormControlLabel,
    Grid,
    TextField,
    Typography,
} from '@mui/material'
import { Card } from '../components/hoc/Card'
import { useMemo, useState } from 'react'
import { useLangs } from '../hooks/useLangs'
import { copy } from '../utils'
import { useAppContext } from '../ctx/app'

export const GenerateChatGPTPage = () => {
    const [learned, setLearned] = useState(false)
    const [notLearned, setNotLearned] = useState(false)
    const [reversed, setReversed] = useState(false)
    const [topic, setTopic] = useState('')
    const [count, setCount] = useState(50)

    const { words } = useAppContext()

    const { nativeLang } = useLangs(reversed)

    const text = useMemo(() => {
        const learnedWords = learned ? words.filter((w) => w.progress >= 1) : []
        const notLearnedWords = notLearned
            ? words.filter((w) => w.progress < 1)
            : []
        const finalWords = [...learnedWords, ...notLearnedWords]

        const fixedCount = Math.abs(count) >= 200 ? 200 : Math.abs(count)

        return [
            'Generate a text without translation',
            nativeLang?.key ? ` in ${nativeLang.name}` : '',
            topic.length > 0 ? ` about ${topic}` : '',
            finalWords.length > 0
                ? ` that includes the words: ${finalWords
                      .map((w) => (reversed ? w.native : w.translation))
                      .join(', ')}`
                : '',
            `. The text should not exceed ${fixedCount} words.`,
        ].join('')
    }, [words, learned, notLearned, reversed, count, topic, nativeLang])

    return (
        <Card>
            <CardContent>
                <Grid container>
                    <Typography></Typography>
                </Grid>
                <Grid container gap={'15px'}>
                    <TextField
                        fullWidth
                        label="Topic"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                    />
                    <TextField
                        fullWidth
                        label="Max words count"
                        type="number"
                        value={count}
                        onChange={(e) => setCount(+e.target.value)}
                    />
                </Grid>
                <Grid container>
                    <FormControlLabel
                        control={
                            <Checkbox
                                value={learned}
                                onChange={() => setLearned((o) => !o)}
                            />
                        }
                        label="Include learned words"
                    />
                </Grid>
                <Grid container>
                    <FormControlLabel
                        control={
                            <Checkbox
                                value={notLearned}
                                onChange={() => setNotLearned((o) => !o)}
                            />
                        }
                        label="Include not learned words"
                    />
                </Grid>
                <Grid container>
                    <ButtonGroup>
                        <Button
                            variant={reversed ? 'contained' : 'outlined'}
                            onClick={() => setReversed(true)}
                        >
                            Native
                        </Button>
                        <Button
                            variant={reversed ? 'outlined' : 'contained'}
                            onClick={() => setReversed(false)}
                        >
                            Translation
                        </Button>
                    </ButtonGroup>
                </Grid>
                <Card>
                    <CardContent>
                        <Typography>{text}</Typography>
                    </CardContent>
                    <CardActions>
                        <Button onClick={() => copy(text)}>copy</Button>
                    </CardActions>
                </Card>
            </CardContent>
        </Card>
    )
}
