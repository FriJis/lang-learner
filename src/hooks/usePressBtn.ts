import { useEffect } from 'react'

export function usePressBtn(fn: (e: KeyboardEvent) => void) {
    useEffect(() => {
        document.addEventListener('keypress', fn)
        return () => document.removeEventListener('keypress', fn)
    }, [fn])
}
