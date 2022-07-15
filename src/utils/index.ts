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

export function download(text: string, name: string, type: string) {
    const a = document.createElement('a')
    const file = new Blob([text], { type })
    a.href = URL.createObjectURL(file)
    a.download = name
    a.click()
    a.remove()
}

export function readTextFromFile(file: File) {
    return new Promise<string>((res, rej) => {
        const reader = new FileReader()

        reader.readAsText(file)
        reader.onload = () =>
            res(_.isString(reader.result) ? reader.result : '')
        reader.onerror = (e) => rej(e)
    })
}

export function jsonParse<T>(val: string): T | null {
    try {
        return JSON.parse(val)
    } catch (error) {
        console.error(error)
        return null
    }
}

export const regCheck = (text: string, toCheck: string) =>
    !!text.match(
        new RegExp(
            toCheck.replace(
                // eslint-disable-next-line
                /\(|\)|\[|\\|\]|\/|\?|\=|\+|\=|\||\.|\,|\!|\@|\#/g,
                ''
            ),
            'gim'
        )
    )
