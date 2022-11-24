import { Slider, Typography } from '@mui/material'
import _ from 'lodash'
import { FC, useMemo } from 'react'
import { lsConf } from '../conf'
import { useLS } from '../hooks/useLS'
import { Statistics } from '../types/statistics'
import { convertStatisticsDataToChart } from '../utils'
import { Chart } from './Chart'

export const StatisticsComponent: FC<{ statistics: Statistics[] }> = ({
    statistics,
}) => {
    const [days, setDays] = useLS(lsConf.statsDays)
    const data = useMemo(
        () => convertStatisticsDataToChart(statistics, days),
        [statistics, days]
    )

    return (
        <>
            <Typography>Statistics days: {days}</Typography>

            <Slider
                min={7}
                max={72}
                step={1}
                value={days}
                onChange={(e, v) => setDays(_.isArray(v) ? v[0] : v)}
            ></Slider>
            <Chart data={data}></Chart>
        </>
    )
}
