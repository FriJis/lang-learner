import { IconButton, Typography } from '@mui/material'
import { FC } from 'react'
import { useLangs } from '../hooks/useLangs'

export const ReverseLangs: FC<{
    reverse: boolean
    setReverse: (val: boolean) => void
}> = ({ reverse, setReverse }) => {
    const langs = useLangs(reverse)

    return (
        <Typography>
            From {langs.native.name}{' '}
            <IconButton onClick={() => setReverse(!reverse)}>
                <i className="fa-solid fa-arrow-right-arrow-left"></i>
            </IconButton>{' '}
            to {langs.translation.name}
        </Typography>
    )
}
