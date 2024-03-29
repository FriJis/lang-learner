import {
    Button,
    CardContent,
    IconButton,
    MenuItem,
    TextField,
    Tooltip,
} from '@mui/material'
import { LearnPage } from './pages/learn'
import { ListPage } from './pages/list'
import { useAppContext } from './ctx/app'
import styles from './App.module.scss'
import { useState } from 'react'
import { db } from './utils/db'
import { Container } from './components/Container'
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted'
import PsychologyIcon from '@mui/icons-material/Psychology'
import { ReadPage } from './pages/text'
import ChromeReaderModeIcon from '@mui/icons-material/ChromeReaderMode'
import { SettingsPage } from './pages/settings'
import SettingsIcon from '@mui/icons-material/Settings'
import { GeneratePage } from './pages/generate'
import DesignServicesIcon from '@mui/icons-material/DesignServices'
import { LearnedWordStatsPage } from './pages/learnedWordsStats'
import AnalyticsIcon from '@mui/icons-material/Analytics'
import { Card } from './components/Card'
import { Select } from './components/Select'

const mainPages = [
    {
        name: 'Words list',
        icon: <FormatListBulletedIcon />,
        component: <ListPage />,
    },
    {
        name: 'Learning',
        icon: <PsychologyIcon />,
        component: <LearnPage />,
    },
    {
        name: 'Reading',
        icon: <ChromeReaderModeIcon />,
        component: <ReadPage />,
    },
    {
        name: 'Generating',
        icon: <DesignServicesIcon />,
        component: <GeneratePage />,
    },
    {
        name: 'Settings',
        icon: <SettingsIcon />,
        component: <SettingsPage />,
    },
    {
        name: 'Statistics',
        icon: <AnalyticsIcon />,
        component: <LearnedWordStatsPage />,
    },
]

function App() {
    const [page, setPage] = useState(mainPages[0].component)
    const { collection, voices } = useAppContext()

    const [newCollection, setNewCollection] = useState('')
    const [newNative, setNewNative] = useState('')
    const [newTranslation, setNewTranslation] = useState('')

    const createCollection = () => {
        if (newCollection.length < 1) return
        db.collections.add({
            name: newCollection,
            active: true,
            nativeLang: newNative,
            translationLang: newTranslation,
        })
    }

    if (!collection)
        return (
            <Container>
                <Card>
                    <CardContent className={styles.firstStep}>
                        <TextField
                            fullWidth
                            placeholder="Name your first collection"
                            variant="standard"
                            value={newCollection}
                            onChange={(e) => setNewCollection(e.target.value)}
                        />
                        <Select
                            label="Choose native language"
                            value={newNative}
                            onChange={(e) =>
                                setNewNative(e.target.value as string)
                            }
                            fullWidth
                        >
                            {voices.map((voice, i) => (
                                <MenuItem value={voice.voiceURI} key={i}>
                                    {voice.name} ({voice.lang})
                                </MenuItem>
                            ))}
                        </Select>
                        <Select
                            label="Choose translation language"
                            value={newTranslation}
                            onChange={(e) =>
                                setNewTranslation(e.target.value as string)
                            }
                            fullWidth
                        >
                            {voices.map((voice, i) => (
                                <MenuItem value={voice.voiceURI} key={i}>
                                    {voice.name} ({voice.lang})
                                </MenuItem>
                            ))}
                        </Select>
                        <Button onClick={createCollection}>save</Button>
                    </CardContent>
                </Card>
            </Container>
        )

    return (
        <Container
            menu={
                <>
                    {mainPages.map((page) => (
                        <Tooltip
                            key={page.name}
                            title={page.name}
                            placement="right"
                            arrow
                        >
                            <IconButton
                                key={page.name}
                                onClick={() => setPage(page.component)}
                            >
                                {page.icon}
                            </IconButton>
                        </Tooltip>
                    ))}
                </>
            }
        >
            {page}
        </Container>
    )
}

export default App
