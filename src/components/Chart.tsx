import { FC, useEffect, useRef } from 'react'

import {
    Chart as Ch,
    ArcElement,
    LineElement,
    BarElement,
    PointElement,
    BarController,
    BubbleController,
    DoughnutController,
    LineController,
    PieController,
    PolarAreaController,
    RadarController,
    ScatterController,
    CategoryScale,
    LinearScale,
    LogarithmicScale,
    RadialLinearScale,
    TimeScale,
    TimeSeriesScale,
    Decimation,
    Filler,
    Legend,
    Title,
    Tooltip,
    SubTitle,
    ChartData,
} from 'chart.js'
import { Box } from '@mui/material'

Ch.register(
    ArcElement,
    LineElement,
    BarElement,
    PointElement,
    BarController,
    BubbleController,
    DoughnutController,
    LineController,
    PieController,
    PolarAreaController,
    RadarController,
    ScatterController,
    CategoryScale,
    LinearScale,
    LogarithmicScale,
    RadialLinearScale,
    TimeScale,
    TimeSeriesScale,
    Decimation,
    Filler,
    Legend,
    Title,
    Tooltip,
    SubTitle
)

export const Chart: FC<{
    data: ChartData<'line', { x: string; y: number }[]>
}> = ({ data }) => {
    const canv = useRef<HTMLCanvasElement>(null)
    useEffect(() => {
        if (!canv.current) return
        const ctx = canv.current.getContext('2d')
        if (!ctx) return

        const c = new Ch(ctx, {
            type: 'line',
            data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                    },
                },
            },
        })
        return () => c.destroy()
    }, [data])
    return (
        <Box sx={{ height: 300, width: '100%' }}>
            <canvas ref={canv}></canvas>
        </Box>
    )
}
