import {
    Backdrop,
    Button,
    CardActions,
    CardContent,
    CircularProgress,
    Dialog,
    DialogTitle,
    Link,
    TextField,
    Typography,
} from '@mui/material'
import _ from 'lodash'
import { ChangeEvent, useState } from 'react'
import { download, jsonParse, readTextFromFile } from '../../utils'
import { getStatistics } from '../../utils/db'
import { Half } from '../../components/Half'
import { useAppContext } from '../../ctx/app'
import { Card } from '../../components/Card'
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
import { useLS } from '../../hooks/useLS'
import { lsConf } from '../../conf'
import { StoreAPI } from '../../utils/http'

export const ExportImportSettings = () => {
    const [err, setErr] = useState(false)
    const [loading, setLoading] = useState(false)
    const [importData, setImportData] = useState<ExportedDataV1 | null>(null)
    const [showAskImport, setShowAskImport] = useState(false)
    const [serverName, setServerName] = useLS(lsConf.serverName)
    const [serverPassword, setServerPassword] = useLS(lsConf.serverPassword)

    const { collection, words } = useAppContext()

    const exportWords = async () => {
        if (!collection) return
        const statistics = await getStatistics()

        download(
            JSON.stringify(mapDataExportWords({ words, statistics })),
            `${collection.name}_words.json`,
            'application/json'
        )
    }

    const exportWordsToServer = async () => {
        if (!collection) return
        setLoading(true)
        try {
            const statistics = await getStatistics()

            const values = mapDataExportWords({ words, statistics })
            StoreAPI.setValue(collection.name, values)
        } catch (error) {
            setErr(true)
            console.error(error)
        }
        setLoading(false)
    }

    const importFromServer = async () => {
        setLoading(true)
        try {
            if (!collection) return
            const { data } = await StoreAPI.getValue(collection.name)
            setImportData(data)
            setShowAskImport(true)
        } catch (error) {
            console.error(error)
            setErr(true)
        }
        setLoading(false)
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

    return (
        <>
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
                    <Typography variant="h4">Server storage</Typography>
                    <Typography color={'gray'}>
                        To use the feature, you should start your own instance
                        of the server.{' '}
                        <Link
                            href="https://github.com/FriJis/lang-learner-server"
                            target="_blank"
                        >
                            GitHub
                        </Link>
                    </Typography>
                    <Half
                        left={
                            <TextField
                                fullWidth
                                value={serverName}
                                onChange={(e) => setServerName(e.target.value)}
                                placeholder="Server host"
                            />
                        }
                        right={
                            <TextField
                                fullWidth
                                value={serverPassword}
                                onChange={(e) =>
                                    setServerPassword(e.target.value)
                                }
                                type="password"
                                placeholder="Server password"
                            />
                        }
                    />
                </CardContent>
                <CardActions>
                    <Button onClick={importFromServer}>import</Button>
                    <Button onClick={exportWordsToServer}>export</Button>
                </CardActions>
            </Card>

            <Card>
                <CardContent>
                    <Typography variant="h4">Import/Export</Typography>
                </CardContent>
                <CardContent>
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
        </>
    )
}
