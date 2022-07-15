import {
    Button,
    Card,
    CardContent,
    Dialog,
    DialogTitle,
    Grid,
    MenuItem,
    Select,
    Slider,
    Typography,
} from '@mui/material'
import _ from 'lodash'
import { ChangeEvent, useCallback, useState } from 'react'
import useLocalStorageState from 'use-local-storage-state'
import { langs, lsConf } from '../conf'
import { ExportedWord } from '../types/word'
import { asyncMap, download, jsonParse, readTextFromFile } from '../utils'
import { db } from '../utils/db'

export const SettingsPage = () => {
    const [err, setErr] = useState(false)

    const [countWords, setCountWords] = useLocalStorageState(
        lsConf.count_words.name,
        {
            defaultValue: lsConf.count_words.def,
        }
    )
    const [successOffset, setSuccessOffset] = useLocalStorageState(
        lsConf.success_offset.name,
        {
            defaultValue: lsConf.success_offset.def,
        }
    )
    const [mistakeOffset, setMistakeOffset] = useLocalStorageState(
        lsConf.mistake_offset.name,
        {
            defaultValue: lsConf.mistake_offset.def,
        }
    )

    const [nativeLang, setNativeLang] = useLocalStorageState(
        lsConf.nativeLang.name,
        {
            defaultValue: lsConf.nativeLang.def,
        }
    )
    const [translationLang, setTranslationLang] = useLocalStorageState(
        lsConf.translationLang.name,
        {
            defaultValue: lsConf.translationLang.def,
        }
    )

    const exportWords = useCallback(async () => {
        const words = await db.words.toArray()
        download(
            JSON.stringify(
                words.map(
                    (w) => [w.native, w.translation, w.progress] as ExportedWord
                )
            ),
            'words.json',
            'application/json'
        )
    }, [])

    const parse = useCallback(async (exported: ExportedWord[]) => {
        const words = await db.words.toArray()

        const mapByNative = new Map(words.map((w) => [w.native, w]))
        const mapByTranslation = new Map(words.map((w) => [w.translation, w]))

        db.transaction('rw', db.words, () =>
            asyncMap(exported, ([native, translation, progress]) => {
                if (native.length <= 0) throw new Error()
                if (translation.length <= 0) throw new Error()

                const exNative = mapByNative.get(native)
                if (exNative)
                    return db.words.update(exNative, { translation, progress })

                const exTranslation = mapByTranslation.get(translation)
                if (exTranslation)
                    return db.words.update(exTranslation, { native, progress })

                return db.words.add({
                    translation: translation.trim().toLowerCase(),
                    native: native.trim().toLowerCase(),
                    progress,
                })
            })
        ).catch(() => {
            throw new Error()
        })
    }, [])

    const importWords = useCallback(
        async (e: ChangeEvent<HTMLInputElement>) => {
            try {
                const [file] = Array.from(e.target.files || [])
                if (!file) throw new Error()
                const result = await readTextFromFile(file)
                const parsed = jsonParse<ExportedWord[]>(result)
                if (!parsed) throw new Error()
                parse(parsed)
            } catch (error) {
                console.error(error)
                setErr(true)
            }
        },
        [parse]
    )

    return (
        <>
            <Dialog open={err} onClose={() => setErr(false)}>
                <DialogTitle>Something is wrong</DialogTitle>
            </Dialog>
            <Card>
                <CardContent>
                    <Typography>Count words: {countWords}</Typography>
                    <Slider
                        min={2}
                        max={30}
                        value={countWords}
                        onChange={(e, v) =>
                            setCountWords(_.isArray(v) ? v[0] : v)
                        }
                    ></Slider>
                    <Typography>Success offset: {successOffset}</Typography>
                    <Slider
                        min={0}
                        max={1}
                        step={0.01}
                        value={successOffset}
                        onChange={(e, v) =>
                            setSuccessOffset(_.isArray(v) ? v[0] : v)
                        }
                    ></Slider>
                    <Typography>Mistake offset: {mistakeOffset}</Typography>
                    <Slider
                        min={0}
                        max={1}
                        step={0.01}
                        value={mistakeOffset}
                        onChange={(e, v) =>
                            setMistakeOffset(_.isArray(v) ? v[0] : v)
                        }
                    ></Slider>
                    <Grid container>
                        <Grid item xs={6}>
                            <Typography>Native language</Typography>

                            <Select
                                value={nativeLang}
                                onChange={(e) => setNativeLang(e.target.value)}
                                fullWidth
                            >
                                {langs.map((l) => (
                                    <MenuItem value={l} key={l}>
                                        {l}
                                    </MenuItem>
                                ))}
                            </Select>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography>Translation language</Typography>
                            <Select
                                value={translationLang}
                                onChange={(e) =>
                                    setTranslationLang(e.target.value)
                                }
                                fullWidth
                            >
                                {langs.map((l) => (
                                    <MenuItem value={l} key={l}>
                                        {l}
                                    </MenuItem>
                                ))}
                            </Select>
                        </Grid>
                    </Grid>
                    <Grid container sx={{ marginTop: '10px' }}>
                        <Grid item xs={6}>
                            <Button variant="contained" onClick={exportWords}>
                                Export words
                            </Button>
                        </Grid>
                        <Grid item xs={6}>
                            <Button component="label">
                                Import words
                                <input
                                    onChange={importWords}
                                    hidden
                                    accept="file/json"
                                    multiple
                                    type="file"
                                />
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </>
    )
}
