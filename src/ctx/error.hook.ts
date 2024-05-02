import { useCallback, useContext } from 'react'
import { ErrorContext } from './error.context'

export const useErrorContext = () => useContext(ErrorContext)

export const useErrorWrapper = () => {
    const { setMessage, setShow } = useErrorContext()
    return useCallback(
        async (fn: () => Promise<any> | any) => {
            try {
                const res = await fn()
                return res
            } catch (error) {
                console.error(error)

                if (error instanceof Error) {
                    setMessage(error.message)
                    setShow(true)
                }
            }
        },
        [setMessage, setShow]
    )
}
