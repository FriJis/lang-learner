import { Grid } from '@mui/material'
import { FC, ReactNode } from 'react'

export const Half: FC<{ left: ReactNode; right: ReactNode }> = ({
    left,
    right,
}) => {
    return (
        <Grid container marginTop={'10px'}>
            <Grid item xs={6} sx={{ paddingRight: '10px' }}>
                {left}
            </Grid>
            <Grid item xs={6} sx={{ paddingLeft: '10px' }}>
                {right}
            </Grid>
        </Grid>
    )
}
