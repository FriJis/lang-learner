import { CardContent, Slider, Typography } from '@mui/material'
import _ from 'lodash'
import { lsConf } from '../../conf'
import { useLS } from '../../hooks/useLS'
import { Card } from '../../components/Card'

export const ControlWorkSettings = () => {
    const [controlWorkTimer, setControlWorkTimer] = useLS(
        lsConf.control_work_timer
    )
    const [maxContinuouslyPassedTests, setMaxContinuouslyPassedTests] = useLS(
        lsConf.maxContinuouslyPassedTests
    )

    return (
        <Card>
            <CardContent>
                <Typography>
                    The difference in days between control works:{' '}
                    {controlWorkTimer > 0 ? controlWorkTimer : 'Has no timer'}
                </Typography>

                <Slider
                    min={0}
                    max={72}
                    step={1}
                    value={controlWorkTimer}
                    onChange={(e, v) =>
                        setControlWorkTimer(_.isArray(v) ? v[0] : v)
                    }
                ></Slider>
                <Typography>
                    number of successful word tests in a row:{' '}
                    {maxContinuouslyPassedTests}
                </Typography>

                <Slider
                    min={1}
                    max={20}
                    step={1}
                    value={maxContinuouslyPassedTests}
                    onChange={(e, v) =>
                        setMaxContinuouslyPassedTests(_.isArray(v) ? v[0] : v)
                    }
                ></Slider>
            </CardContent>
        </Card>
    )
}
