import { FC, PropsWithChildren, useState } from 'react'
import { ErrorContext } from './error.context'
import { Snackbar } from '@mui/material'

export const ErrorProvider: FC<PropsWithChildren> = ({ children }) => {
    const [show, setShow] = useState(false)
    const [message, setMessage] = useState<null | string>(null)
    return (
        <ErrorContext.Provider value={{ message, show, setMessage, setShow }}>
            {children}
            <Snackbar
                open={show}
                message={message}
                onClose={() => setShow(false)}
                autoHideDuration={3000}
            />
        </ErrorContext.Provider>
    )
}
