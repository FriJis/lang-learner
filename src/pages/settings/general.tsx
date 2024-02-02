import { CardContent, Slider, TextField, Typography } from '@mui/material'
import _ from 'lodash'
import { lsConf } from '../../conf'
import { useLS } from '../../hooks/useLS'
import { Card, Cards } from '../../components/Card'

export const GeneralSettings = () => {
    const [successOffset, setSuccessOffset] = useLS(lsConf.success_offset)
    const [mistakeOffset, setMistakeOffset] = useLS(lsConf.mistake_offset)
    const [countWords, setCountWords] = useLS(lsConf.count_words)
    const [learnFirst, setLearnFirst] = useLS(lsConf.learn_first)
    const [translator, setTranslator] = useLS(lsConf.translator)
    const [speakRate, setSpeakRate] = useLS(lsConf.speakRate)

    return (
        <Cards>
            <Card>
                <CardContent>
                    <Typography variant="h5">
                        Success coefficient: {successOffset}
                    </Typography>
                    <Typography>
                        The coefficient that is responsible for successful
                        completion of the task. If the progress of a word was 50
                        percent and you set 0.2, then if you successfully
                        complete the task, the final progress will be 70 percent
                        (0.5 + 0.2 = 0.7). The higher you set the value, the
                        faster the word becomes learned
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
                        Mistake coefficient: {mistakeOffset}
                    </Typography>
                    <Typography>
                        The coefficient that is responsible for failing a task.
                        If the word progress was 50 percent and you put 0.5, the
                        final progress will be 25 percent (0.5 * 0.5 = 0.25) if
                        the answer is wrong. The higher you set the value, the
                        more leniently the error will be factored into the
                        current progress. If you set it to 0, even the slightest
                        error will set the word progress to 0 percent
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
                    <Typography variant="h5">
                        Number of answer choices in the quiz: {countWords}
                    </Typography>

                    <Slider
                        min={2}
                        max={30}
                        value={countWords}
                        onChange={(e, v) =>
                            setCountWords(_.isArray(v) ? v[0] : v)
                        }
                    ></Slider>
                    <Typography variant="h5">
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

                    <Typography variant="h5">
                        Synthesis speed {speakRate}
                    </Typography>
                    <Slider
                        min={0.5}
                        max={2}
                        step={0.1}
                        value={speakRate}
                        onChange={(e, v) =>
                            setSpeakRate(_.isArray(v) ? v[0] : v)
                        }
                    ></Slider>
                    <Typography variant="h5">
                        Link for translation helper
                    </Typography>
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
        </Cards>
    )
}
