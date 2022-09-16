import { useEffect } from 'react'

export function usePressBtn(fn: (e: KeyboardEvent) => void) {
    useEffect(() => {
        document.addEventListener('keydown', fn)
        return () => document.removeEventListener('keydown', fn)
    }, [fn])
}
