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
    learn = 'learn',
    settings = 'settings',
    faq = 'faq',
    read = 'read',
}

enum LearnPages {
    quiz = 'quiz',
    write = 'write',
    listening = 'listening',
    controlWork = 'controlWork',
}

function App() {
    const [page, setPage] = useState<Pages>(Pages.list)
    const [learnPage, setLearnPage] = useState<LearnPages>(LearnPages.quiz)

    return (
        <Container>
            <Tabs value={page} onChange={(e, v) => setPage(v)}>
                <Tab label="List" value={Pages.list}></Tab>
                <Tab label="Learn" value={Pages.learn}></Tab>
                <Tab label="Read" value={Pages.read}></Tab>
                <Tab label="Settings" value={Pages.settings}></Tab>
                <Tab label="FAQ" value={Pages.faq}></Tab>
            </Tabs>

            {page === Pages.list && <ListPage></ListPage>}
            {page === Pages.learn && (
                <>
                    <Tabs
                        value={learnPage}
                        onChange={(e, v) => setLearnPage(v)}
                    >
                        <Tab label="Quiz" value={LearnPages.quiz}></Tab>
                        <Tab label="Write" value={LearnPages.write}></Tab>
                        <Tab
                            label="Listening"
                            value={LearnPages.listening}
                        ></Tab>
                        <Tab
                            label="Control Work"
                            value={LearnPages.controlWork}
                        ></Tab>
                    </Tabs>
                    {learnPage === LearnPages.quiz && <LearnPage></LearnPage>}
                    {learnPage === LearnPages.write && <WritePage></WritePage>}
                    {learnPage === LearnPages.listening && (
                        <ListenPage></ListenPage>
                    )}
                    {learnPage === LearnPages.controlWork && (
                        <ControlWorkPage></ControlWorkPage>
                    )}
                </>
            )}
            {page === Pages.settings && <SettingsPage></SettingsPage>}
            {page === Pages.faq && <FaqPage></FaqPage>}
            {page === Pages.read && <ReadPage></ReadPage>}
        </Container>
    )
}

export default App
