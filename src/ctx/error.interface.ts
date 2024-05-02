export interface ErrorContextValue {
    show: boolean
    setShow: (state: boolean) => void
    message: string | null
    setMessage: (state: string | null) => void
}
