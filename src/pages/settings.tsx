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
    TextField,
    Typography,
} from '@mui/material'
import { useLiveQuery } from 'dexie-react-hooks'
import _ from 'lodash'
import { ChangeEvent, FC, useCallback, useMemo, useState } from 'react'
import { lsConf, mappedLangs } from '../conf'
import { useLS } from '../hooks/useLS'
import { Collection } from '../types/collection'
import { ExportedWord } from '../types/word'
import {
    asyncMap,
    download,
    jsonParse,
    normalize,
    readTextFromFile,
} from '../utils'
import { db, getCollection, getWords } from '../utils/db'

export const SettingsPage = () => {
    const [err, setErr] = useState(false)

    const [countWords, setCountWords] = useLS(lsConf.count_words)
    const [successOffset, setSuccessOffset] = useLS(lsConf.success_offset)
    const [mistakeOffset, setMistakeOffset] = useLS(lsConf.mistake_offset)
    const [learnFirst, setLearnFirst] = useLS(lsConf.learn_first)

    const collections = useLiveQuery(() => db.collections.toArray())
    const collection = useLiveQuery(() => getCollection())
    const nativeLang = useMemo(() => collection?.nativeLang || '', [collection])
    const translationLang = useMemo(
        () => collection?.translationLang || '',
        [collection]
    )

    const setLang = useCallback(
        (type: 'nativeLang' | 'translationLang', lang: string) => {
            if (!collection) return
            db.collections.update(collection, { [type]: lang })
        },
        [collection]
    )

    const exportWords = useCallback(async () => {
        const collection = await getCollection()
        if (!collection) return
        const words = await getWords()

        download(
            JSON.stringify(
                words.map(
                    (w) =>
                        [
                            w.native,
                            w.translation,
                            w.progress,
                            w.info || '',
                        ] as ExportedWord
                )
            ),
            `${collection.name}_words.json`,
            'application/json'
        )
    }, [])

    const parse = useCallback(async (exported: ExportedWord[]) => {
        const collection = await getCollection()
        if (!collection) return
        const words = await getWords()

        const mapByNative = new Map(words.map((w) => [w.native, w]))
        const mapByTranslation = new Map(words.map((w) => [w.translation, w]))

        db.transaction('rw', db.words, async () => {
            await asyncMap(
                exported,
                ([native, translation, progress, info]) => {
                    if (native.length <= 0) throw new Error()
                    if (translation.length <= 0) throw new Error()

                    const exNative = mapByNative.get(native)
                    if (exNative)
                        return db.words.update(exNative, {
                            translation,
                            progress,
                        })

                    const exTranslation = mapByTranslation.get(translation)
                    if (exTranslation)
                        return db.words.update(exTranslation, {
                            native,
                            progress,
                        })

                    return db.words.add({
                        translation: normalize(translation),
                        native: normalize(native),
                        progress,
                        collectionId: collection.id || 0,
                        info,
                    })
                }
            )
        }).catch(() => {
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
                    <Typography>
                        {learnFirst > 0
                            ? `Learn first of ${learnFirst} words`
                            : 'Has no limit'}
                    </Typography>
                    <Slider
                        min={0}
                        max={50}
                        value={learnFirst}
                        onChange={(e, v) =>
                            setLearnFirst(_.isArray(v) ? v[0] : v)
                        }
                    ></Slider>
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
                    <Typography>
                        Feature progress = current progress (0.5) +{' '}
                        {successOffset} ={' '}
                        {0.5 + successOffset > 1
                            ? 1
                            : _.round(0.5 + successOffset, 2)}
                    </Typography>
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
                    <Typography>
                        Feature progress = current progress (0.5) *{' '}
                        {mistakeOffset} = {_.round(0.5 * mistakeOffset, 2)}
                    </Typography>
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
                                onChange={(e) =>
                                    setLang('nativeLang', e.target.value)
                                }
                                fullWidth
                            >
                                {mappedLangs.map((l, i) => (
                                    <MenuItem value={l.value} key={i}>
                                        {l.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography>Translation language</Typography>
                            <Select
                                value={translationLang}
                                onChange={(e) =>
                                    setLang('translationLang', e.target.value)
                                }
                                fullWidth
                            >
                                {mappedLangs.map((l, i) => (
                                    <MenuItem value={l.value} key={i}>
                                        {l.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </Grid>
                    </Grid>
                    <Grid container sx={{ marginTop: '10px' }}>
                        <Grid item xs={6}>
                            <Button variant="contained" onClick={exportWords}>
                                Export collection
                            </Button>
                        </Grid>
                        <Grid item xs={6}>
                            <Button component="label">
                                Import into current collection
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
            <Card style={{ marginTop: 10 }}>
                <CardContent>
                    <Typography variant="h4">Collections</Typography>
                    {collections?.map((collection) => (
                        <CollectionSetting
                            collection={collection}
                            key={collection.id}
                        ></CollectionSetting>
                    ))}
                    <CollectionSetting></CollectionSetting>
                </CardContent>
            </Card>
        </>
    )
}

const CollectionSetting: FC<{ collection?: Collection }> = ({ collection }) => {
    const [newName, setNewName] = useState(collection?.name || '')

    const update = useCallback(async () => {
        const activeCollection = await getCollection()

        setNewName('')
        if (!collection)
            return db.collections.add({
                active: !activeCollection ? true : false,
                name: newName,
            })
        db.collections.update(collection, { name: newName })
    }, [collection, newName])

    const del = useCallback(() => {
        if (!collection) return
        const confirmation = window.confirm(
            'Do you want to delete this collection? It will lead to delete all depending words'
        )
        if (!confirmation) return
        db.collections.delete(collection.id || 0)
    }, [collection])

    const changeActive = useCallback(async () => {
        if (!collection) return
        await db.collections.toCollection().modify((collection) => {
            collection.active = false
        })
        db.collections.update(collection, { active: true })
    }, [collection])

    return (
        <Grid container alignItems="center" sx={{ mt: '10px' }}>
            <Grid item xs={9}>
                <TextField
                    variant="outlined"
                    fullWidth
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Name..."
                ></TextField>
            </Grid>
            <Grid item xs={1} display="flex" justifyContent="center">
                {!!newName && collection?.name !== newName && (
                    <Button onClick={update} color="success">
                        <i className="fa-solid fa-floppy-disk"></i>
                    </Button>
                )}
            </Grid>
            <Grid item xs={1} display="flex" justifyContent="center">
                {!!collection && (
                    <Button
                        onClick={changeActive}
                        color={collection.active ? 'success' : undefined}
                        variant="contained"
                    >
                        <i className="fa-solid fa-eye"></i>
                    </Button>
                )}
            </Grid>
            <Grid item xs={1} display="flex" justifyContent="center">
                {!!collection && (
                    <Button color="error" onClick={del}>
                        <i className="fa-solid fa-trash"></i>
                    </Button>
                )}
            </Grid>
        </Grid>
    )
}
