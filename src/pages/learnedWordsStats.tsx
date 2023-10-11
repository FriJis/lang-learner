import { CardContent } from '@mui/material'
import { FC } from 'react'
import { StatisticsComponent } from '../components/Statistics'
import { useAppContext } from '../ctx/app'
import { Card } from '../components/Card'

export const LearnedWordStatsPage: FC = () => {
    const { statistics } = useAppContext()

    return (
        <Card>
            <CardContent>
                <StatisticsComponent
                    statistics={statistics}
                ></StatisticsComponent>
            </CardContent>
        </Card>
    )
}
