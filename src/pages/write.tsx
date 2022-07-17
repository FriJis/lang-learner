import {
    Button,
    Card,
    CardActions,
    CardContent,
    Input,
    Snackbar,
    Typography,
} from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import { Word } from '../types/word'
import { getRandomValueFromArray } from '../utils'
import { db } from '../utils/db'
import { compareTwoStrings } from 'string-similarity'
import { useUpdateProgress } from '../hooks/useUpdateProgress'
import { Form } from '../components/Form'

export const WritePage = () => {
    const [word, setWord] = useState<Word | null>(null)
    const [result, setResult] = useState('')
    const [helper, setHelper] = useState('')
    const [prev, setPrev] = useState<Word | null>(null)

    const generate = useCallback(async () => {
        const words = await db.words.toArray()
        const word = getRandomValueFromArray(words)
        if (!word) return
        setResult('')
        setHelper('')
        setWord(word)
    }, [])

    const updater = useUpdateProgress(word)

    const compare = useCallback(async () => {
        if (!word) return
        const compared = compareTwoStrings(word.translation || '', result)
        const hintRatio = helper.length / word.translation.length

        console.log(compared - hintRatio)

        await updater?.success(compared - hintRatio)

        generate()
        setPrev(word)
    }, [result, word, updater, generate, helper])

    const help = useCallback(() => {
        const nextIndex = helper.length + 1
        const nextHint = word?.translation.slice(0, nextIndex) || ''
        setHelper(nextHint)
    }, [helper, word])

    useEffect(() => {
        generate()
    }, [generate])

    return (
        <>
            <Snackbar
                open={!!prev}
                onClose={() => setPrev(null)}
                message={`${prev?.native} - ${prev?.translation}`}
                autoHideDuration={5000}
            ></Snackbar>
            <Form onSubmit={compare}>
                <Card>
                    <CardContent>
                        <Typography>{word?.native}</Typography>
                        {helper.length > 0 && (
                            <Typography color={'gray'}>
                                Hint: {helper}
                            </Typography>
                        )}
                        <Input
                            value={result}
                            placeholder="Translation..."
                            onChange={(e) => setResult(e.target.value)}
                            fullWidth
                        ></Input>
                    </CardContent>
                    <CardActions>
                        <Button onClick={help}>Hint with one letter</Button>
                        <Button
                            type="submit"
                            variant="contained"
                            color="success"
                        >
                            Check
                        </Button>
                    </CardActions>
                </Card>
            </Form>
        </>
    )
}
