import { CardContent, Slider, Typography } from '@mui/material'
import _ from 'lodash'
import { lsConf } from '../../conf'
import { useLS } from '../../hooks/useLS'
import { Card } from '../../components/Card'

export const QuizSettings = () => {
    const [countWords, setCountWords] = useLS(lsConf.count_words)

    return (
        <Card>
            <CardContent>
                <Typography>Count words: {countWords}</Typography>
                <Slider
                    min={2}
                    max={30}
                    value={countWords}
                    onChange={(e, v) => setCountWords(_.isArray(v) ? v[0] : v)}
                ></Slider>
            </CardContent>
        </Card>
    )
}
