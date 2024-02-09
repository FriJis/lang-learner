import {
    Backdrop,
    Button,
    CardActions,
    CardContent,
    CircularProgress,
    Dialog,
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
import { download, jsonParse, readTextFromFile } from '../../utils'
import { db } from '../../utils/db'
import { Half } from '../../components/Half'
import { useAppContext } from '../../ctx/app'
import SaveIcon from '@mui/icons-material/Save'
import VisibilityIcon from '@mui/icons-material/Visibility'
import DeleteIcon from '@mui/icons-material/Delete'
import { Card, Cards } from '../../components/Card'
import { Select } from '../../components/Select'
import { WordImporter } from '../../components/WordImporter'
import {
    ExportedDataV1,
    ExportedWordDeprecated,
} from '../../types/exportedData'
import {
    mapDataExportWords,
    mapDataGoogleTranslateV1,
    mapDeprecatedDataV1,
} from '../../utils/exportData'

export const CollectionSettings = () => {
    const [err, setErr] = useState(false)
    const [loading, setLoading] = useState(false)
    const [importData, setImportData] = useState<ExportedDataV1 | null>(null)
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
            JSON.stringify(mapDataExportWords(words)),
            `${collection.name}_words.json`,
            'application/json'
        )
    }

    const importWords = async (e: ChangeEvent<HTMLInputElement>) => {
        try {
            const [file] = Array.from(e.target.files || [])
            if (!file) throw new Error()
            const json = await readTextFromFile(file)
            const importedData = jsonParse<
                ExportedWordDeprecated[] | ExportedDataV1
            >(json)

            if (_.isArray(importedData)) {
                if (importedData.length === 0) return
                setImportData(mapDeprecatedDataV1(importedData))
            } else {
                setImportData(importedData)
            }

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

            const importingCollection = mapDataGoogleTranslateV1(result)

            if (importingCollection.words.length === 0) return

            setImportData(importingCollection)
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

    return (
        <Cards>
            <Dialog open={err} onClose={() => setErr(false)}>
                <DialogTitle>Something is wrong</DialogTitle>
            </Dialog>
            {!!importData && (
                <WordImporter
                    open={showAskImport}
                    onChange={(values) => setImportData(values)}
                    value={importData}
                    onClose={() => setShowAskImport(false)}
                />
            )}

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
