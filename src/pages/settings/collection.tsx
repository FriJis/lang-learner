import {
    Backdrop,
    Button,
    CardActions,
    CardContent,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
    MenuItem,
    TextField,
    Typography,
} from '@mui/material'
import { useLiveQuery } from 'dexie-react-hooks'
import _ from 'lodash'
import { ChangeEvent, FC, useCallback, useState } from 'react'
import { Collection } from '../../types/collection'
import { ExportedWord } from '../../types/word'
import {
    asyncMap,
    download,
    jsonParse,
    normalize,
    readTextFromFile,
} from '../../utils'
import { db, getWords } from '../../utils/db'
import { Half } from '../../components/Half'
import { useAppContext } from '../../ctx/app'
import SaveIcon from '@mui/icons-material/Save'
import VisibilityIcon from '@mui/icons-material/Visibility'
import DeleteIcon from '@mui/icons-material/Delete'
import { Card, Cards } from '../../components/Card'
import papaparse from 'papaparse'
import styles from './collection.module.scss'
import CompareArrowsIcon from '@mui/icons-material/CompareArrows'
import { Select } from '../../components/Select'

export const CollectionSettings = () => {
    const [err, setErr] = useState(false)
    const [loading, setLoading] = useState(false)
    const [askImport, setAskImport] = useState<ExportedWord[]>([])
    const [showAskImport, setShowAskImport] = useState(false)

    const collections = useLiveQuery(() => db.collections.toArray())
    const {
        collection,
        statistics,
        words,
        nativeLang,
        translationLang,
        voices,
    } = useAppContext()

    const setLang = (type: 'nativeLang' | 'translationLang', lang: string) => {
        if (!collection) return
        db.collections.update(collection, { [type]: lang })
    }

    const exportWords = async () => {
        if (!collection) return

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
    }

    const parse = async (exported: ExportedWord[]) => {
        if (!collection) return
        const words = await getWords()

        const mapWords = new Map(
            words.map((w) => [
                `${normalize(w.native)}-${normalize(w.translation)}`,
                w,
            ])
        )

        db.transaction('rw', db.words, async () => {
            await asyncMap(
                exported,
                ([native, translation, progress, info]) => {
                    if (native.length <= 0) throw new Error()
                    if (translation.length <= 0) throw new Error()

                    const existing = mapWords.get(
                        `${normalize(native)}-${normalize(translation)}`
                    )
                    const data = {
                        translation: normalize(translation),
                        native: normalize(native),
                        info: info || '',
                    }
                    if (!existing)
                        return db.words.add({
                            ...data,
                            progress: progress || 0,
                            collectionId: collection.id || 0,
                        })
                    return db.words.update(existing, {
                        ...data,
                        progress: _.isUndefined(progress)
                            ? existing.progress
                            : progress,
                    })
                }
            )
        }).catch(() => {
            throw new Error()
        })
    }

    const importWords = async (e: ChangeEvent<HTMLInputElement>) => {
        try {
            const [file] = Array.from(e.target.files || [])
            if (!file) throw new Error()
            const json = await readTextFromFile(file)
            const words = jsonParse<ExportedWord[]>(json)
            if (!words) throw new Error()
            if (words.length === 0) return
            setAskImport(words)
            setShowAskImport(true)
        } catch (error) {
            console.error(error)
            setErr(true)
        }
    }

    const importCSV = async (e: ChangeEvent<HTMLInputElement>) => {
        try {
            const [file] = Array.from(e.target.files || [])
            if (!file) throw new Error()
            const result = await readTextFromFile(file)
            const csvString = papaparse.parse<string[]>(result, {
                header: false,
            })
            const words: ExportedWord[] = csvString.data.map((row) => {
                const [, , native, translation] = row
                return [native, translation, undefined, undefined]
            })
            if (words.length === 0) return
            setAskImport(words)
            setShowAskImport(true)
        } catch (error) {
            console.error(error)
            setErr(true)
        }
    }

    const deleteWords = async () => {
        const confirmation = window.confirm('are you sure?')
        if (!confirmation) return
        setLoading(true)
        try {
            await Promise.all(
                words.map(
                    (word) =>
                        !_.isUndefined(word.id) && db.words.delete(word.id)
                )
            )
        } catch (error) {
            console.error(error)
        }
        setLoading(false)
    }

    const deleteStatistics = async () => {
        const confirmation = window.confirm('are you sure?')
        if (!confirmation) return
        setLoading(true)
        try {
            await Promise.all(
                statistics.map(
                    (stat) =>
                        !_.isUndefined(stat.id) && db.statistics.delete(stat.id)
                )
            )
        } catch (error) {
            console.error(error)
        }
        setLoading(false)
    }

    const resetProgress = async () => {
        const confirmation = window.confirm('are you sure?')
        if (!confirmation) return
        setLoading(true)
        try {
            await Promise.all(
                words.map((word) => db.words.update(word, { progress: 0 }))
            )
        } catch (error) {
            console.error(error)
        }
        setLoading(false)
    }

    const confirmAskImport = async () => {
        await parse(askImport)
        setShowAskImport(false)
    }

    const reverseAskImportWord = (index: number) => {
        setAskImport((old) => {
            return old.map((data, i) => {
                if (i !== index) return data
                const [first, second, ...other] = data
                return [second, first, ...other]
            })
        })
    }

    const reverseAskImportWords = () => {
        setAskImport((old) =>
            old.map(([first, second, ...other]) => [second, first, ...other])
        )
    }

    return (
        <Cards>
            <Dialog open={err} onClose={() => setErr(false)}>
                <DialogTitle>Something is wrong</DialogTitle>
            </Dialog>
            <Dialog
                open={showAskImport}
                onClose={() => setShowAskImport(false)}
            >
                <DialogTitle>Confirm importing words</DialogTitle>
                <DialogContent>
                    <div className={styles.row}>
                        <div className={styles.fill}>
                            <Typography>
                                <b>{nativeLang?.name}</b>
                            </Typography>
                        </div>
                        <div className={styles.button}>
                            <IconButton onClick={reverseAskImportWords}>
                                <CompareArrowsIcon />
                            </IconButton>
                        </div>
                        <div className={styles.fill}>
                            <Typography>
                                <b>{translationLang?.name}</b>
                            </Typography>
                        </div>
                    </div>
                    {askImport.map(([native, translation], i) => (
                        <div className={styles.row} key={i}>
                            <div className={styles.fill}>
                                <Typography>{native}</Typography>
                            </div>
                            <div className={styles.button}>
                                <IconButton
                                    onClick={() => reverseAskImportWord(i)}
                                >
                                    <CompareArrowsIcon />
                                </IconButton>
                            </div>
                            <div className={styles.fill}>
                                <Typography>{translation}</Typography>
                            </div>
                        </div>
                    ))}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowAskImport(false)}>
                        cancel
                    </Button>
                    <Button onClick={confirmAskImport}>confirm</Button>
                </DialogActions>
            </Dialog>
            <Backdrop open={loading}>
                <CircularProgress color="inherit" />
            </Backdrop>
            <Card>
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
            <Card>
                <CardContent>
                    <Half
                        left={
                            <Select
                                label="Native language"
                                value={nativeLang?.voiceURI}
                                onChange={(e) =>
                                    setLang(
                                        'nativeLang',
                                        e.target.value as string
                                    )
                                }
                                fullWidth
                            >
                                {voices.map((voice, i) => (
                                    <MenuItem value={voice.voiceURI} key={i}>
                                        {voice.name} ({voice.lang})
                                    </MenuItem>
                                ))}
                            </Select>
                        }
                        right={
                            <Select
                                label="Translation language"
                                value={translationLang?.voiceURI}
                                onChange={(e) =>
                                    setLang(
                                        'translationLang',
                                        e.target.value as string
                                    )
                                }
                                fullWidth
                            >
                                {voices.map((voice, i) => (
                                    <MenuItem value={voice.voiceURI} key={i}>
                                        {voice.name} ({voice.lang})
                                    </MenuItem>
                                ))}
                            </Select>
                        }
                    ></Half>
                    <Half
                        left={
                            <Button variant="contained" onClick={exportWords}>
                                Export collection
                            </Button>
                        }
                        right={
                            <>
                                <Button component="label">
                                    Import into current collection
                                    <input
                                        onChange={importWords}
                                        hidden
                                        accept=".json"
                                        multiple
                                        type="file"
                                    />
                                </Button>
                                <Button component="label">
                                    Import CSV from google translate
                                    <input
                                        onChange={importCSV}
                                        hidden
                                        accept=".csv"
                                        multiple
                                        type="file"
                                    />
                                </Button>
                            </>
                        }
                    ></Half>
                </CardContent>
            </Card>
            <Card>
                <CardContent>
                    <Typography variant="h4">Operations with words</Typography>
                </CardContent>
                <CardActions>
                    <Button color="error" onClick={resetProgress}>
                        Reset the progress of each word from this collection
                    </Button>
                    <Button color="error" onClick={deleteWords}>
                        Remove all words from this collection
                    </Button>
                    <Button color="error" onClick={deleteStatistics}>
                        Delete all statistics of this collection
                    </Button>
                </CardActions>
            </Card>
        </Cards>
    )
}

const CollectionSetting: FC<{ collection?: Collection }> = ({ collection }) => {
    const [newName, setNewName] = useState(collection?.name || '')
    const { collection: activeCollection } = useAppContext()

    const update = useCallback(async () => {
        setNewName('')
        if (!collection)
            return db.collections.add({
                active: !activeCollection ? true : false,
                name: newName,
            })
        db.collections.update(collection, { name: newName })
    }, [collection, newName, activeCollection])

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
                    <IconButton onClick={update} color="success">
                        <SaveIcon />
                    </IconButton>
                )}
            </Grid>
            <Grid item xs={1} display="flex" justifyContent="center">
                {!!collection && (
                    <IconButton
                        onClick={changeActive}
                        color={collection.active ? 'success' : undefined}
                    >
                        <VisibilityIcon />
                    </IconButton>
                )}
            </Grid>
            <Grid item xs={1} display="flex" justifyContent="center">
                {!!collection && (
                    <IconButton color="error" onClick={del}>
                        <DeleteIcon />
                    </IconButton>
                )}
            </Grid>
        </Grid>
    )
}
