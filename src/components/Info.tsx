import { IconButton, Tooltip } from '@mui/material'
import { FC } from 'react'
import { Word } from '../types/word'
import InfoIcon from '@mui/icons-material/Info'

export const Info: FC<{ word: Word }> = ({ word }) => {
    if (!word.info) return null

    return (
        <Tooltip title={word.info}>
            <IconButton>
                <InfoIcon />
            </IconButton>
        </Tooltip>
    )
}
