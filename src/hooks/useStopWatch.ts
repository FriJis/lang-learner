import moment from 'moment'
import { useEffect, useMemo, useState } from 'react'

export function useStopWatch() {
    const [time, setTime] = useState(0)
    const parsed = useMemo(() => {
        const secs = moment.duration(time).seconds()
        const minutes = moment.duration(time).minutes()
        return `${minutes}:${secs}`
    }, [time])

    useEffect(() => {
        const id = setInterval(() => {
            setTime((o) => o + 1000)
        }, 1000)
        return () => clearInterval(id)
    }, [])

    return parsed
}
