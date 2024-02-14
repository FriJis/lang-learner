import {
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material'
import { FC, useMemo, useState } from 'react'
import styles from './WordImporter.module.scss'
import { db, getWords } from '../utils/db'
import { asyncMap, minMax, normalize } from '../utils'
import _ from 'lodash'
import { useAppContext } from '../ctx/app'
import CompareArrowsIcon from '@mui/icons-material/CompareArrows'
import { useLiveQuery } from 'dexie-react-hooks'
import clsx from 'clsx'
import CloseIcon from '@mui/icons-material/Close'
import { ExportedDataV1, ExportedWordV1 } from '../types/exportedData'

export const WordImporter: FC<{
    open: boolean
    onClose: () => void
    value: ExportedDataV1
    onChange: (value: ExportedDataV1) => void
}> = ({ open, onClose, value, onChange }) => {
    const { collection, nativeLang, translationLang } = useAppContext()

    const words = useLiveQuery(() => getWords())
    const [importStatistics, setImportStatistics] = useState(false)

    const wordsSet = useMemo(
        () =>
            new Set(
                words?.map(
                    (word) =>
                        `${normalize(word.native)}-${normalize(
                            word.translation
                        )}`
                )
            ),
        [words]
    )

    const nativeSets = useMemo(
        () => new Set(words?.map((word) => normalize(word.native))),
        [words]
    )
    const translationSets = useMemo(
        () => new Set(words?.map((word) => normalize(word.translation))),
        [words]
    )

    const parse = async () => {
        const collectionId = collection?.id
        if (!collectionId) return
        const words = await getWords()

        const mapWords = new Map(
            words.map((w) => [
                `${normalize(w.native)}-${normalize(w.translation)}`,
                w,
            ])
        )

        await db
            .transaction('rw', db.words, db.statistics, async () => {
                await asyncMap(value.words, (word) => {
                    const { native, translation, progress } = word
                    if (native.length <= 0) throw new Error()
                    if (translation.length <= 0) throw new Error()

                    const existing = mapWords.get(
                        `${normalize(native)}-${normalize(translation)}`
                    )
                    const data = {
                        ...word,
                        translation: normalize(translation),
                        native: normalize(native),
                    }
                    if (!existing)
                        return db.words.add({
                            ...data,
                            progress: minMax(progress || 0, 0, 1),
                            collectionId: collectionId,
                        })
                    return db.words.update(existing, {
                        ...data,
                        progress: _.isUndefined(progress)
                            ? existing.progress
                            : progress,
                    })
                })
                if (!value.statistics) return
                if (!importStatistics) return

                await db.statistics.clear()
                await db.statistics.bulkAdd(
                    value.statistics.map((s) => ({ ...s, collectionId }))
                )
            })
            .catch(() => {
                throw new Error('parse error')
            })

        onClose()
    }

    const reverse = (index: number) => {
        const word = value.words[index]
        if (!word) return null

        value.words.splice(index, 1, {
            ...value,
            native: word.translation,
            translation: word.native,
        })

        onChange({
            ...value,
        })
    }

    const reverseAll = () => {
        const reversed = value.words.map<ExportedWordV1>((word) => ({
            ...word,
            native: word.translation,
            translation: word.native,
        }))
        onChange({
            ...value,
            words: reversed,
        })
    }

    const deleteWord = (index: number) => {
        value.words.splice(index, 1)
        onChange({ ...value })
    }

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Confirm importing words</DialogTitle>
            <DialogContent>
                {!!value.statistics && (
                    <FormControlLabel
                        control={
                            <Checkbox
                                value={importStatistics}
                                onChange={() => setImportStatistics((o) => !o)}
                            />
                        }
                        label="Import new stats? The current one will be deleted"
                    />
                )}
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                <Typography>
                                    <b>{nativeLang?.name}</b>
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <IconButton onClick={reverseAll}>
                                    <CompareArrowsIcon />
                                </IconButton>
                            </TableCell>
                            <TableCell>
                                <Typography>
                                    <b>{translationLang?.name}</b>
                                </Typography>
                            </TableCell>
                            <TableCell />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {value.words.map((word, i) => (
                            <TableRow
                                className={clsx({
                                    [styles.has]: wordsSet.has(
                                        `${normalize(word.native)}-${normalize(
                                            word.translation
                                        )}`
                                    ),
                                })}
                                key={i}
                            >
                                <TableCell
                                    className={clsx({
                                        [styles.has]: nativeSets.has(
                                            normalize(word.native)
                                        ),
                                    })}
                                >
                                    <Typography>{word.native}</Typography>
                                </TableCell>
                                <TableCell>
                                    <IconButton onClick={() => reverse(i)}>
                                        <CompareArrowsIcon />
                                    </IconButton>
                                </TableCell>
                                <TableCell>
                                    <Typography>{word.translation}</Typography>
                                </TableCell>
                                <TableCell
                                    className={clsx({
                                        [styles.has]: translationSets.has(
                                            normalize(word.translation)
                                        ),
                                    })}
                                >
                                    <IconButton onClick={() => deleteWord(i)}>
                                        <CloseIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>cancel</Button>
                <Button onClick={parse}>confirm</Button>
            </DialogActions>
        </Dialog>
    )
}
