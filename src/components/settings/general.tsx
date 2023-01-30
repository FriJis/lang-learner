import { CardContent, Slider, TextField, Typography } from '@mui/material'
import _ from 'lodash'
import { lsConf } from '../../conf'
import { useLS } from '../../hooks/useLS'
import { Card } from '../hoc/Card'

export const GeneralSettings = () => {
    const [successOffset, setSuccessOffset] = useLS(lsConf.success_offset)
    const [mistakeOffset, setMistakeOffset] = useLS(lsConf.mistake_offset)
    const [learnFirst, setLearnFirst] = useLS(lsConf.learn_first)
    const [translator, setTranslator] = useLS(lsConf.translator)
    const [speakRate, setSpeakRate] = useLS(lsConf.speakRate)

    return (
        <>
            <Card>
                <CardContent>
                    <Typography variant="h5">
                        Success offset: {successOffset}
                    </Typography>
                    <Typography>
                        Feature progress = current progress (0.5) +{' '}
                        {successOffset} ={' '}
                        {0.5 + successOffset > 1
                            ? 1
                            : _.round(0.5 + successOffset, 2)}
                    </Typography>
                    <Slider
                        min={0}
                        max={1}
                        step={0.01}
                        value={successOffset}
                        onChange={(e, v) =>
                            setSuccessOffset(_.isArray(v) ? v[0] : v)
                        }
                    ></Slider>

                    <Typography variant="h5">
                        Mistake offset: {mistakeOffset}
                    </Typography>
                    <Typography>
                        Feature progress = current progress (0.5) *{' '}
                        {mistakeOffset} = {_.round(0.5 * mistakeOffset, 2)}
                    </Typography>

                    <Slider
                        min={0}
                        max={1}
                        step={0.01}
                        value={mistakeOffset}
                        onChange={(e, v) =>
                            setMistakeOffset(_.isArray(v) ? v[0] : v)
                        }
                    ></Slider>
                </CardContent>
            </Card>
            <Card>
                <CardContent>
                    <Typography>
                        {learnFirst > 0
                            ? `Learn first of ${learnFirst} words`
                            : 'Has no limit'}
                    </Typography>
                    <Slider
                        min={0}
                        max={50}
                        value={learnFirst}
                        onChange={(e, v) =>
                            setLearnFirst(_.isArray(v) ? v[0] : v)
                        }
                    ></Slider>

                    <Typography>Synthesis speed {speakRate}</Typography>
                    <Slider
                        min={0.5}
                        max={2}
                        step={0.1}
                        value={speakRate}
                        onChange={(e, v) =>
                            setSpeakRate(_.isArray(v) ? v[0] : v)
                        }
                    ></Slider>
                    <Typography>Link for translation helper</Typography>
                    <Typography>
                        {'{{nativeLang}}, {{translationLang}}, {{text}}'}
                    </Typography>
                    <TextField
                        variant="outlined"
                        fullWidth
                        value={translator}
                        onChange={(e) => setTranslator(e.target.value)}
                        placeholder="Name..."
                    ></TextField>
                </CardContent>
            </Card>
        </>
    )
}
