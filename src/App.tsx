import { Container } from '@mui/material'
import { PageManager } from './components/PageManager'
import { AuditionPage } from './pages/audition'
import { ControlWorkPage } from './pages/controlWork'
import { LearnPage } from './pages/learn'
import { ListPage } from './pages/list'
import { ListenPage } from './pages/listen'
import { ReadPage } from './pages/read'
import { SettingsPage } from './pages/settings'
import { WritePage } from './pages/write'

enum Pages {
    list = 'list',
    learn = 'learn',
    settings = 'settings',
    faq = 'faq',
    text = 'text',
}

enum LearnPages {
    quiz = 'quiz',
    write = 'write',
    listening = 'listening',
    controlWork = 'controlWork',
}

enum TextPages {
    read = 'read',
    audition = 'audition',
}

function App() {
    return (
        <Container>
            <PageManager
                pages={[
                    {
                        label: 'List',
                        value: Pages.list,
                        component: <ListPage></ListPage>,
                    },
                    {
                        label: 'Learn',
                        value: Pages.learn,
                        component: (
                            <PageManager
                                pages={[
                                    {
                                        label: 'Quiz',
                                        value: LearnPages.quiz,
                                        component: <LearnPage></LearnPage>,
                                    },
                                    {
                                        label: 'Write',
                                        value: LearnPages.write,
                                        component: <WritePage></WritePage>,
                                    },
                                    {
                                        label: 'Listening',
                                        value: LearnPages.listening,
                                        component: <ListenPage></ListenPage>,
                                    },
                                    {
                                        label: 'Final test',
                                        value: LearnPages.controlWork,
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
                        value: Pages.text,
                        component: (
                            <PageManager
                                pages={[
                                    {
                                        label: 'Read',
                                        value: TextPages.read,
                                        component: <ReadPage></ReadPage>,
                                    },
                                    {
                                        label: 'Audition',
                                        value: TextPages.audition,
                                        component: (
                                            <AuditionPage></AuditionPage>
                                        ),
                                    },
                                ]}
                            ></PageManager>
                        ),
                    },
                    {
                        label: 'Settings',
                        value: Pages.settings,
                        component: <SettingsPage></SettingsPage>,
                    },
                ]}
            ></PageManager>
        </Container>
    )
}

export default App
