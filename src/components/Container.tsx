import { FC, PropsWithChildren, ReactNode } from 'react'
import styles from './Container.module.scss'

export const Container: FC<PropsWithChildren & { menu?: ReactNode }> = ({
    children,
    menu,
}) => {
    return (
        <div className={styles.container}>
            {menu && <div className={styles.menu}>{menu}</div>}
            <div className={styles.content}>{children}</div>
        </div>
    )
}
