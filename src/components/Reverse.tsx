import { IconButton, Typography } from '@mui/material'
import { FC } from 'react'
import { useLangs } from '../hooks/useLangs'

export const ReverseLangs: FC<{
    reverse: boolean
    setReverse: (val: boolean) => void
}> = ({ reverse, setReverse }) => {
    const { nativeLang, translationLang } = useLangs(reverse)

    return (
        <Typography>
            From {nativeLang?.name}{' '}
            <IconButton onClick={() => setReverse(!reverse)}>
                <i className="fa-solid fa-arrow-right-arrow-left"></i>
            </IconButton>{' '}
            to {translationLang?.name}
        </Typography>
    )
}
