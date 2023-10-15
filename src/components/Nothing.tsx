import { CardContent, Typography } from '@mui/material'
import { FC } from 'react'
import { Card } from './Card'

export const Nothing: FC<{ msg?: string }> = ({ msg }) => {
    return (
        <Card>
            <CardContent>
                <Typography align="center">
                    {!!msg
                        ? msg
                        : "Nothing to learn. At the time, You don't have words in learning process"}
                </Typography>
            </CardContent>
        </Card>
    )
}
