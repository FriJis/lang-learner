import { Container, Tab, Tabs } from '@mui/material'
import { useState } from 'react'
import { ControlWorkPage } from './pages/controlWork'
import { FaqPage } from './pages/faq'
import { LearnPage } from './pages/learn'
import { ListPage } from './pages/list'
import { ListenPage } from './pages/listen'
import { ReadPage } from './pages/read'
import { SettingsPage } from './pages/settings'
import { WritePage } from './pages/write'

enum Pages {
    list = 'list',
    quiz = 'quiz',
    settings = 'settings',
    write = 'write',
    listening = 'listening',
    controlWork = 'controlWork',
    faq = 'faq',
    read = 'read',
}

function App() {
    const [page, setPage] = useState<Pages>(Pages.list)

    return (
        <Container>
            <Tabs value={page} onChange={(e, v) => setPage(v)}>
                <Tab label="List" value={Pages.list}></Tab>
                <Tab label="Quiz" value={Pages.quiz}></Tab>
                <Tab label="Write" value={Pages.write}></Tab>
                <Tab label="Listening" value={Pages.listening}></Tab>
                <Tab label="Read" value={Pages.read}></Tab>
                <Tab label="Control Work" value={Pages.controlWork}></Tab>
                <Tab label="Settings" value={Pages.settings}></Tab>
                <Tab label="FAQ" value={Pages.faq}></Tab>
            </Tabs>

            {page === Pages.list && <ListPage></ListPage>}
            {page === Pages.quiz && <LearnPage></LearnPage>}
            {page === Pages.write && <WritePage></WritePage>}
            {page === Pages.listening && <ListenPage></ListenPage>}
            {page === Pages.controlWork && <ControlWorkPage></ControlWorkPage>}
            {page === Pages.settings && <SettingsPage></SettingsPage>}
            {page === Pages.faq && <FaqPage></FaqPage>}
            {page === Pages.read && <ReadPage></ReadPage>}
        </Container>
    )
}

export default App
