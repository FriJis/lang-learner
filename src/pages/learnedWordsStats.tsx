import { CardContent } from '@mui/material'
import { FC } from 'react'
import { Card } from '../components/hoc/Card'
import { StatisticsComponent } from '../components/Statistics'
import { useAppContext } from '../ctx/app'

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
