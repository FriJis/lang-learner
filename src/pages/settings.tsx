import {
    Card,
    CardContent,
    Grid,
    MenuItem,
    Select,
    Slider,
    Typography,
} from '@mui/material'
import _ from 'lodash'
import useLocalStorageState from 'use-local-storage-state'
import { langs, lsConf } from '../conf'

export const SettingsPage = () => {
    const [countWords, setCountWords] = useLocalStorageState(
        lsConf.count_words.name,
        {
            defaultValue: lsConf.count_words.def,
        }
    )
    const [successOffset, setSuccessOffset] = useLocalStorageState(
        lsConf.success_offset.name,
        {
            defaultValue: lsConf.success_offset.def,
        }
    )
    const [mistakeOffset, setMistakeOffset] = useLocalStorageState(
        lsConf.mistake_offset.name,
        {
            defaultValue: lsConf.mistake_offset.def,
        }
    )

    const [nativeLang, setNativeLang] = useLocalStorageState(
        lsConf.nativeLang.name,
        {
            defaultValue: lsConf.nativeLang.def,
        }
    )
    const [translationLang, setTranslationLang] = useLocalStorageState(
        lsConf.translationLang.name,
        {
            defaultValue: lsConf.translationLang.def,
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
                <Grid container>
                    <Grid item xl={6}>
                        <Typography>Native language</Typography>

                        <Select
                            value={nativeLang}
                            onChange={(e) => setNativeLang(e.target.value)}
                            fullWidth
                        >
                            {langs.map((l) => (
                                <MenuItem value={l} key={l}>
                                    {l}
                                </MenuItem>
                            ))}
                        </Select>
                    </Grid>
                    <Grid item xl={6}>
                        <Typography>Translation language</Typography>
                        <Select
                            value={translationLang}
                            onChange={(e) => setTranslationLang(e.target.value)}
                            fullWidth
                        >
                            {langs.map((l) => (
                                <MenuItem value={l} key={l}>
                                    {l}
                                </MenuItem>
                            ))}
                        </Select>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    )
}
