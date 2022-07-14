import _ from 'lodash'

export function getRandomValueFromArray<T>(arr: T[]): T {
    return arr[_.random(0, arr.length - 1)]
}

export async function asyncMap<T, S>(
    values: T[],
    fn: (value: T) => Promise<S>
): Promise<S[]> {
    const results: S[] = []
    for (const value of values) {
        results.push(await fn(value))
    }
    return results
}

export function say(text: string, lang?: string) {
    const message = new SpeechSynthesisUtterance()
    message.lang = lang || 'en-EN'
    message.text = text
    window.speechSynthesis.speak(message)
}

export const normalize = (text: string) => text.trim().toLocaleLowerCase()

export const regCheck = (text: string, toCheck: string) =>
    !!text.match(new RegExp(toCheck, 'gim'))
