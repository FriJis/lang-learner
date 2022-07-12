import { Card, CardContent, Slider, Typography } from '@mui/material'
import _ from 'lodash'
import useLocalStorageState from 'use-local-storage-state'

export const SettingsPage = () => {
    const [countWords, setCountWords] = useLocalStorageState('count_words', {
        defaultValue: 5,
    })
    const [successOffset, setSuccessOffset] = useLocalStorageState(
        'success_offset',
        {
            defaultValue: 0.05,
        }
    )
    const [mistakeOffset, setMistakeOffset] = useLocalStorageState(
        'mistake_offset',
        {
            defaultValue: 0.5,
        }
    )

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
                <Typography>Success offset: {successOffset}</Typography>
                <Slider
                    min={0}
                    max={1}
                    step={0.01}
                    value={successOffset}
                    onChange={(e, v) =>
                        setSuccessOffset(_.isArray(v) ? v[0] : v)
                    }
                ></Slider>
                <Typography>Mistake offset: {mistakeOffset}</Typography>
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
    )
}
