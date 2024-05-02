import { createContext } from 'react'
import { ErrorContextValue } from './error.interface'

export const ErrorContext = createContext<ErrorContextValue>({
    show: false,
    setMessage: () => {},
    message: null,
    setShow: () => {},
})
