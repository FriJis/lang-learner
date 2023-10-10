import { Tab, Tabs } from '@mui/material'
import { FC, ReactNode, useState } from 'react'
import styles from './PageManager.module.scss'

interface PageManagerPage {
    label: string
    value: string
    component: ReactNode
}

export const PageManager: FC<{ pages: PageManagerPage[] }> = ({ pages }) => {
    const [current, setCurrent] = useState(
        pages[0]?.component as string | undefined
    )

    return (
        <div className={styles.container}>
            <Tabs value={current} onChange={(e, v) => setCurrent(v)}>
                {pages.map((page) => (
                    <Tab
                        key={page.value}
                        label={page.label}
                        value={page.component}
                    ></Tab>
                ))}
            </Tabs>
            <div className={styles.content}>{current}</div>
        </div>
    )
}
