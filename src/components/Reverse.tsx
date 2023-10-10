import { IconButton, Typography } from '@mui/material'
import { FC } from 'react'
import { useLangs } from '../hooks/useLangs'
import CompareArrowsIcon from '@mui/icons-material/CompareArrows'

export const ReverseLangs: FC<{
    reverse: boolean
    setReverse: (val: boolean) => void
}> = ({ reverse, setReverse }) => {
    const { nativeLang, translationLang } = useLangs(reverse)

    return (
        <Typography>
            From {nativeLang?.name}{' '}
            <IconButton onClick={() => setReverse(!reverse)}>
                <CompareArrowsIcon />
            </IconButton>{' '}
            to {translationLang?.name}
        </Typography>
    )
}
