import { FC, PropsWithChildren } from 'react'
import styles from './Card.module.scss'

export const Cards: FC<PropsWithChildren> = ({ children }) => {
    return <div className={styles.cards}>{children}</div>
}

export const Card: FC<PropsWithChildren> = ({ children }) => {
    return <div className={styles.card}>{children}</div>
}
