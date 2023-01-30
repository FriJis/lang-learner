import { CardContent, Slider, Typography } from '@mui/material'
import _ from 'lodash'
import { lsConf } from '../../conf'
import { useLS } from '../../hooks/useLS'
import { Card } from '../hoc/Card'

export const ControlWorkSettings = () => {
    const [controlWorkTimer, setControlWorkTimer] = useLS(
        lsConf.control_work_timer
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
            </CardContent>
        </Card>
    )
}
