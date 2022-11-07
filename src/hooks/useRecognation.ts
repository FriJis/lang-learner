import { useEffect, useMemo } from 'react'
import SpeechRecognition, {
    useSpeechRecognition,
} from 'react-speech-recognition'
import { useLangs } from './useLangs'

export function useRecognation(
    active: boolean,
    commands: string[],
    fn: (text: string) => void
) {
    const coms = useMemo(
        () => commands.map((command) => ({ command, callback: fn })),
        [commands, fn]
    )

    const {
        browserSupportsSpeechRecognition,
        resetTranscript,
        finalTranscript,
    } = useSpeechRecognition({ clearTranscriptOnListen: true })

    const langs = useLangs()

    useEffect(() => {
        if (!active) return
        if (!browserSupportsSpeechRecognition) return

        SpeechRecognition.startListening({
            continuous: true,
            language: langs.translation.key,
        })
        return () => SpeechRecognition.stopListening()
    }, [browserSupportsSpeechRecognition, active, langs])

    // useEffect(() => {
    //     if(!finalTranscript) return
    //     fn(finalTranscript)
    //     resetTranscript()
    // }, [finalTranscript, resetTranscript, fn])
}
