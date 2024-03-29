import {
    List,
    ListItem,
    ListItemText,
    Popover,
    CardActions,
    Button,
    Box,
    ListItemSecondaryAction,
    IconButton,
} from '@mui/material'
import {
    FC,
    PropsWithChildren,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react'
import { findWords, sayNative, sayTranslation } from '../utils'
import { WordEditor } from './WordEditor'
import { useLangs } from '../hooks/useLangs'
import { useLS } from '../hooks/useLS'
import { lsConf } from '../conf'
import { Word as IWord } from '../types/word'
import { useAppContext } from '../ctx/app'
import PlayCircleIcon from '@mui/icons-material/PlayCircle'

export const PopoverHelper: FC<PropsWithChildren<{ reverse?: boolean }>> = ({
    children,
    reverse,
}) => {
    const [nativeWord, setNativeWord] = useState('')
    const [translationWord, setTranslationWord] = useState('')
    const [showEditor, setShowEditor] = useState(false)
    const textRef = useRef<HTMLDivElement>(null)

    const [popoverMeta, setPopoverMeta] = useState<{
        top: number
        left: number
        text: string
    } | null>(null)
    const [open, setOpen] = useState(false)

    const { words } = useAppContext()

    const filteredWords = useMemo(
        () =>
            popoverMeta?.text
                ? findWords(
                      words || [],
                      reverse ? '' : popoverMeta.text,
                      reverse ? popoverMeta.text : ''
                  )
                : [],
        [words, popoverMeta?.text, reverse]
    )

    const { translationLang, nativeLang } = useLangs(reverse)

    const [translator] = useLS(lsConf.translator)

    const showTranslation = () => {
        const text = popoverMeta?.text
        if (!text) return

        const link = translator
            .replaceAll('{{nativeLang}}', nativeLang?.key || '')
            .replaceAll('{{translationLang}}', translationLang?.key || '')
            .replaceAll('{{text}}', text.trim())
        window.open(link, 'translator')
        setShowEditor(true)
        setNativeWord('')
        setTranslationWord('')
        if (reverse) return setTranslationWord(text)
        setNativeWord(text)
    }

    useEffect(() => {
        const current = textRef?.current
        if (!current) return
        const h = () => {
            const selection = document.getSelection()

            if (!selection) return
            const text = selection.toString()
            if (text.length < 1) return
            const clientRect = selection.getRangeAt(0).getBoundingClientRect()

            setPopoverMeta({ top: clientRect.top, left: clientRect.left, text })
            setOpen(true)
        }
        current.addEventListener('mouseup', h)
        return () => current.removeEventListener('mouseup', h)
    }, [textRef])

    const close = useCallback(() => {
        setOpen(false)
        window.speechSynthesis.cancel()
    }, [])

    const listen = (word: IWord) => {
        window.speechSynthesis.cancel()
        sayTranslation(word.translation)
        sayNative(word.native)
    }

    return (
        <>
            <Box ref={textRef}>{children}</Box>
            <Popover
                open={open}
                anchorReference="anchorPosition"
                anchorPosition={{
                    top: popoverMeta?.top || 0,
                    left: popoverMeta?.left || 0,
                }}
                onClose={close}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
            >
                {filteredWords.length > 0 && (
                    <List>
                        {filteredWords.map((word) => (
                            <ListItem key={word.id}>
                                <ListItemText
                                    primary={
                                        reverse ? word.translation : word.native
                                    }
                                    secondary={
                                        reverse ? word.native : word.translation
                                    }
                                />
                                <ListItemSecondaryAction>
                                    <IconButton onClick={() => listen(word)}>
                                        <PlayCircleIcon />
                                    </IconButton>
                                </ListItemSecondaryAction>
                            </ListItem>
                        ))}
                    </List>
                )}
                <CardActions>
                    <Button
                        size="small"
                        onClick={() =>
                            reverse
                                ? sayTranslation(popoverMeta?.text || '')
                                : sayNative(popoverMeta?.text || '')
                        }
                    >
                        listen
                    </Button>
                    <Button size="small" onClick={showTranslation}>
                        show translation
                    </Button>
                </CardActions>
            </Popover>
            <WordEditor
                nativeState={[nativeWord, setNativeWord]}
                translationState={[translationWord, setTranslationWord]}
                show={showEditor}
                onClose={() => setShowEditor(false)}
            ></WordEditor>
        </>
    )
}
