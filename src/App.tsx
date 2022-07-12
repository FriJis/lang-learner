import { Container, Tab, Tabs } from '@mui/material'
import { useState } from 'react'
import { LearnPage } from './pages/learn'
import { ListPage } from './pages/list'
import { ParsingPage } from './pages/parsing'
import { SettingsPage } from './pages/settings'

enum Pages {
    list = 'list',
    learn = 'learn',
    parsing = 'parsing',
    settings = 'settings',
}

function App() {
    const [page, setPage] = useState<Pages>(Pages.list)

    return (
        <Container>
            <Tabs value={page} onChange={(e, v) => setPage(v)}>
                <Tab label="List" value={Pages.list}></Tab>
                <Tab label="Learn" value={Pages.learn}></Tab>
                <Tab label="Parsing" value={Pages.parsing}></Tab>
                <Tab label="Settings" value={Pages.settings}></Tab>
            </Tabs>

            {page === Pages.list && <ListPage></ListPage>}
            {page === Pages.learn && <LearnPage></LearnPage>}
            {page === Pages.parsing && <ParsingPage></ParsingPage>}
            {page === Pages.settings && <SettingsPage></SettingsPage>}
        </Container>
    )
}

export default App
