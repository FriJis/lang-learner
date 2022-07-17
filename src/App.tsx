import { Container, Tab, Tabs } from '@mui/material'
import { useState } from 'react'
import { LearnPage } from './pages/learn'
import { ListPage } from './pages/list'
import { SettingsPage } from './pages/settings'
import { WritePage } from './pages/write'

enum Pages {
    list = 'list',
    learn = 'learn',
    settings = 'settings',
    write = 'write',
}

function App() {
    const [page, setPage] = useState<Pages>(Pages.list)

    return (
        <Container>
            <Tabs value={page} onChange={(e, v) => setPage(v)}>
                <Tab label="List" value={Pages.list}></Tab>
                <Tab label="Learn" value={Pages.learn}></Tab>
                <Tab label="Write" value={Pages.write}></Tab>
                <Tab label="Settings" value={Pages.settings}></Tab>
            </Tabs>

            {page === Pages.list && <ListPage></ListPage>}
            {page === Pages.learn && <LearnPage></LearnPage>}
            {page === Pages.write && <WritePage></WritePage>}
            {page === Pages.settings && <SettingsPage></SettingsPage>}
        </Container>
    )
}

export default App
