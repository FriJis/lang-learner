import { Card, CardContent, Typography } from '@mui/material'
import { FC } from 'react'

export const Nothing: FC<{ msg?: string }> = ({ msg }) => {
    return (
        <Card>
            <CardContent>
                <Typography align="center">
                    {!!msg ? msg : 'Nothing to learn'}
                </Typography>
            </CardContent>
        </Card>
    )
}
