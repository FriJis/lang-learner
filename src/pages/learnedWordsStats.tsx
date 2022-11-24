import { CardContent } from '@mui/material'
import { useLiveQuery } from 'dexie-react-hooks'
import { FC } from 'react'
import { Card } from '../components/hoc/Card'
import { StatisticsComponent } from '../components/Statistics'
import { getStatistics } from '../utils/db'

export const LearnedWordStatsPage: FC = () => {
    const statistics = useLiveQuery(() => getStatistics())

    return (
        <Card>
            <CardContent>
                <StatisticsComponent
                    statistics={statistics || []}
                ></StatisticsComponent>
            </CardContent>
        </Card>
    )
}
