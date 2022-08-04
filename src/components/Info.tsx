import { IconButton, Tooltip } from '@mui/material'
import { FC } from 'react'
import { Word } from '../types/word'

export const Info: FC<{ word: Word }> = ({ word }) => {
    if (!word.info) return null

    return (
        <Tooltip title={word.info}>
            <IconButton>
                <i className="fa-solid fa-circle-info"></i>
            </IconButton>
        </Tooltip>
    )
}
