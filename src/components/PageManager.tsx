import { Tab, Tabs } from '@mui/material'
import { Container } from '@mui/system'
import { FC, ReactNode, useState } from 'react'

interface PageManagerPage {
    label: string
    value: string
    component: ReactNode
}

export const PageManager: FC<{ pages: PageManagerPage[] }> = ({ pages }) => {
    const [current, setCurrent] = useState(
        pages[0]?.value as string | undefined
    )

    return (
        <>
            <Tabs value={current} onChange={(e, v) => setCurrent(v)}>
                {pages.map((page) => (
                    <Tab
                        key={page.value}
                        label={page.label}
                        value={page.value}
                    ></Tab>
                ))}
            </Tabs>
            {pages.map((page) =>
                page.value === current ? (
                    <Container key={page.value}>{page.component}</Container>
                ) : null
            )}
        </>
    )
}
