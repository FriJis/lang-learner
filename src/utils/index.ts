import { ChartData } from 'chart.js'
import { t } from 'i18next'
import _ from 'lodash'
import moment, { Moment } from 'moment'
import { lsConf } from '../conf'
import { Statistics, StatisticsType } from '../types/statistics'
import { Word } from '../types/word'
import { getCollection } from './db'

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

export function findWords(words: Word[], native: string, translation: string) {
    return words.filter(
        (w) =>
            regCheck(w.native, native) && regCheck(w.translation, translation)
    )
}

export function say(text: string, voiceURI?: string) {
    const message = new SpeechSynthesisUtterance()
    const voice = window.speechSynthesis
        .getVoices()
        .find((voice) => voice.voiceURI === voiceURI)
    if (!voice) return

    message.voice = voice
    message.lang = voice.lang
    message.text = text
    const conf = lsConf.speakRate
    message.rate = +(localStorage.getItem(conf.name) || conf.def)
    window.speechSynthesis.speak(message)
}

export async function sayNative(text: string) {
    const collection = await getCollection()
    say(text, collection?.nativeLang)
}
export async function sayTranslation(text: string) {
    const collection = await getCollection()
    say(text, collection?.translationLang)
}

// eslint-disable-next-line
export const badRegEx = /\(|\)|\[|\\|\]|\/|\?|\=|\+|\=|\||\.|\,|\!|\@|\#|[0-9]/g

export const normalize = (text: string) =>
    text.trim().toLocaleLowerCase().replace(badRegEx, '')

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
    !!text.match(new RegExp(_.escapeRegExp(toCheck), 'gim'))

export function convertStatisticsDataToChart(
    statistics: Statistics[],
    days: number = 60
): ChartData<'line', { x: string; y: number }[]> {
    const format = (data: Moment) => data.format('MM-DD-YYYY')

    const filteredStats = statistics.filter((stat) => {
        const diff = moment(stat.createdAt).diff(
            moment().subtract(days, 'days')
        )
        return diff >= 0
    })

    const types = Array.from(new Set(Object.values(StatisticsType)).values())

    const dates = Array(days)
        .fill('')
        .map((_, i) => format(moment().utc().subtract(i, 'days')))
        .reverse()

    const mappedTypes = filteredStats.reduce<
        Map<StatisticsType, Map<string, Statistics[]>>
    >((acc, stats) => {
        const createdAt = format(moment(stats.createdAt))
        const dates = acc.get(stats.type)
        if (!dates) return acc
        const oldTypes = dates.get(createdAt)
        if (!oldTypes) return acc
        dates.set(createdAt, [...oldTypes, stats])
        return acc
    }, new Map(types.map((t) => [t, new Map(dates.map((date) => [date, []]))])))

    return {
        datasets: Array.from(mappedTypes.entries()).map(([label, dates]) => ({
            label: t(`stats.${label}`).toString(),
            borderColor: t(`color.${label}`).toString(),
            backgroundColor: t(`color.${label}`).toString(),
            data: Array.from(dates).map(([date, stats]) => ({
                x: date,
                y: stats.length,
            })),
        })),
    }
}

export const copy = (text: string) => {
    const i = document.createElement('input')
    i.value = text
    document.body.append(i)
    i.select()
    document.execCommand('copy')
    i.remove()
}

export const minMax = (value: number, min: number, max: number) => {
    if (value <= min) return min
    if (value >= max) return max
    return value
}
