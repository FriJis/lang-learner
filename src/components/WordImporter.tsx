import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material'
import { FC, useMemo } from 'react'
import styles from './WordImporter.module.scss'
import { ExportedWord } from '../types/word'
import { db, getWords } from '../utils/db'
import { asyncMap, minMax, normalize } from '../utils'
import _ from 'lodash'
import { useAppContext } from '../ctx/app'
import CompareArrowsIcon from '@mui/icons-material/CompareArrows'
import { useLiveQuery } from 'dexie-react-hooks'
import clsx from 'clsx'
import CloseIcon from '@mui/icons-material/Close'

export const WordImporter: FC<{
    open: boolean
    onClose: () => void
    values: ExportedWord[]
    onChange: (values: ExportedWord[]) => void
}> = ({ open, onClose, values, onChange }) => {
    const { collection, nativeLang, translationLang } = useAppContext()

    const words = useLiveQuery(() => getWords())

    const wordsSet = useMemo(
        () =>
            new Set(words?.map((word) => `${word.native}-${word.translation}`)),
        [words]
    )

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
                            progress: minMax(progress || 0, 0, 1),
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

    const confirm = async () => {
        await parse(values)
        onClose()
    }

    const reverse = (index: number) => {
        const value = values[index]
        if (!value) return null

        const [first, second, ...other] = value

        // values[index] = [second, first, ...other]

        values.splice(index, 1, [second, first, ...other])

        onChange([...values])
    }

    const reverseAll = () => {
        const reversed = values.map<ExportedWord>(
            ([first, second, ...other]) => [second, first, ...other]
        )
        onChange(reversed)
    }

    const deleteWord = (index: number) => {
        values.splice(index, 1)
        onChange([...values])
    }

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Confirm importing words</DialogTitle>
            <DialogContent>
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
                        {values.map(([native, translation], i) => (
                            <TableRow
                                className={clsx({
                                    [styles.has]: wordsSet.has(
                                        `${native}-${translation}`
                                    ),
                                })}
                                key={i}
                            >
                                <TableCell>
                                    <Typography>{native}</Typography>
                                </TableCell>
                                <TableCell>
                                    <IconButton onClick={() => reverse(i)}>
                                        <CompareArrowsIcon />
                                    </IconButton>
                                </TableCell>
                                <TableCell>
                                    <Typography>{translation}</Typography>
                                </TableCell>
                                <TableCell>
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
                <Button onClick={confirm}>confirm</Button>
            </DialogActions>
        </Dialog>
    )
}
