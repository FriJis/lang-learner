import { FC, FormEvent, PropsWithChildren, useCallback } from 'react'

type E = FormEvent<HTMLFormElement>

export const Form: FC<PropsWithChildren<{ onSubmit: (e: E) => void }>> = ({
    onSubmit,
    children,
}) => {
    const sub = useCallback(
        (e: E) => {
            e.preventDefault()
            onSubmit(e)
        },
        [onSubmit]
    )

    return <form onSubmit={sub}>{children}</form>
}
