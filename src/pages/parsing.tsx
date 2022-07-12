import {
    Button,
    Card,
    CardActions,
    CardContent,
    Dialog,
    DialogTitle,
    TextField,
    Typography,
} from '@mui/material'
import _ from 'lodash'
import { useCallback, useState } from 'react'
import { asyncMap } from '../utils'
import { db } from '../utils/db'

export const ParsingPage = () => {
    const [values, setValues] = useState('')
    const [err, setErr] = useState(false)

    const parse = useCallback(async () => {
        try {
            const json: [string, string][] = JSON.parse(`[${values}]`)
            const words = await db.words.toArray()

            const mapByNative = new Map(words.map((w) => [w.native, w]))
            const mapByTranslation = new Map(
                words.map((w) => [w.translation, w])
            )

            db.transaction('rw', db.words, () =>
                asyncMap(json, ([native, translation]) => {
                    if (!_.isString(native)) throw new Error()
                    if (!_.isString(translation)) throw new Error()
                    if (native.length <= 0) throw new Error()
                    if (translation.length <= 0) throw new Error()

                    const exNative = mapByNative.get(native)
                    if (exNative)
                        return db.words.update(exNative, { translation })

                    const exTranslation = mapByTranslation.get(translation)
                    if (exTranslation)
                        return db.words.update(exTranslation, { native })

                    return db.words.add({
                        translation: translation.trim(),
                        native: native.trim(),
                        progress: 0,
                    })
                })
            ).catch(() => setErr(true))
        } catch (error) {
            console.error(error)

            setErr(true)
        }
    }, [values])

    return (
        <>
            <Dialog open={err} onClose={() => setErr(false)}>
                <DialogTitle>Something is wrong</DialogTitle>
            </Dialog>
            <Card>
                <CardContent>
                    <Typography>
                        ["native", "translation"], ["native", "translation"]...
                    </Typography>
                </CardContent>
                <CardContent>
                    <TextField
                        variant="filled"
                        fullWidth
                        value={values}
                        onChange={(e) => setValues(e.target.value)}
                    ></TextField>
                </CardContent>
                <CardActions>
                    <Button onClick={parse}>Parse</Button>
                </CardActions>
            </Card>
        </>
    )
}
