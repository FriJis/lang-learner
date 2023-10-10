import { Button, Card, CardContent, TextField } from '@mui/material'
import { PageManager } from './components/PageManager'
import { CollectionSettings } from './components/settings/collection'
import { ControlWorkSettings } from './components/settings/controlWork'
import { GeneralSettings } from './components/settings/general'
import { AuditionPage } from './pages/audition'
import { ControlWorkPage } from './pages/controlWork'
import { LearnPage } from './pages/learn'
import { LearnedWordStatsPage } from './pages/learnedWordsStats'
import { ListPage } from './pages/list'
import { ListenPage } from './pages/listen'
import { ReadPage } from './pages/read'
import { WritePage } from './pages/write'
import { GenerateChatGPTPage } from './pages/generateChatGPT'
import { useAppContext } from './ctx/app'
import styles from './App.module.scss'
import { useEffect, useState } from 'react'
import { db } from './utils/db'

function App() {
    const { collection } = useAppContext()

    const [newCollection, setNewCollection] = useState('')

    const createCollection = () => {
        db.collections.add({ name: newCollection, active: true })
    }

    useEffect(() => {
        window.speechSynthesis.getVoices()
    }, [])

    if (!collection)
        return (
            <Card>
                <CardContent className={styles.firstStep}>
                    <TextField
                        fullWidth
                        label="Your first collection"
                        value={newCollection}
                        onChange={(e) => setNewCollection(e.target.value)}
                    />
                    <Button onClick={createCollection}>save</Button>
                </CardContent>
            </Card>
        )

    return (
        <PageManager
            pages={[
                {
                    label: 'List',
                    value: 'list',
                    component: <ListPage></ListPage>,
                },
                {
                    label: 'Learn',
                    value: 'learn',
                    component: (
                        <PageManager
                            pages={[
                                {
                                    label: 'Quiz',
                                    value: 'quiz',
                                    component: <LearnPage></LearnPage>,
                                },
                                {
                                    label: 'Write',
                                    value: 'write',
                                    component: <WritePage></WritePage>,
                                },
                                {
                                    label: 'Listening',
                                    value: 'listening',
                                    component: <ListenPage></ListenPage>,
                                },
                                {
                                    label: 'Final test',
                                    value: 'controlWork',
                                    component: (
                                        <ControlWorkPage></ControlWorkPage>
                                    ),
                                },
                            ]}
                        ></PageManager>
                    ),
                },
                {
                    label: 'Text',
                    value: 'text',
                    component: (
                        <PageManager
                            pages={[
                                {
                                    label: 'Read',
                                    value: 'read',
                                    component: <ReadPage></ReadPage>,
                                },
                                {
                                    label: 'Audition',
                                    value: 'audition',
                                    component: <AuditionPage></AuditionPage>,
                                },
                            ]}
                        ></PageManager>
                    ),
                },
                {
                    label: 'Settings',
                    value: 'settings',
                    component: (
                        <PageManager
                            pages={[
                                {
                                    label: 'General',
                                    value: 'general',
                                    component: <GeneralSettings />,
                                },
                                {
                                    label: 'Collections',
                                    value: 'collections',
                                    component: <CollectionSettings />,
                                },
                                {
                                    label: 'Control test',
                                    value: 'controlTest',
                                    component: <ControlWorkSettings />,
                                },
                            ]}
                        />
                    ),
                },
                {
                    label: 'Generate',
                    value: 'generate',
                    component: (
                        <PageManager
                            pages={[
                                {
                                    label: 'Chat-GPT',
                                    value: 'chatgpt',
                                    component: <GenerateChatGPTPage />,
                                },
                            ]}
                        />
                    ),
                },
                {
                    label: 'Statistics',
                    value: 'statistics',
                    component: <LearnedWordStatsPage />,
                },
            ]}
        />
    )
}

export default App
