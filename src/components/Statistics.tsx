import { FC, useMemo } from 'react'
import { Statistics } from '../types/statistics'
import { convertStatisticsDataToChart } from '../utils'
import { Chart } from './Chart'

export const StatisticsComponent: FC<{ statistics: Statistics[] }> = ({
    statistics,
}) => {
    const data = useMemo(
        () => convertStatisticsDataToChart(statistics),
        [statistics]
    )

    return (
        <>
            <Chart data={data}></Chart>
        </>
    )
}
