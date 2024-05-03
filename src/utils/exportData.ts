import {
    ExportedDataV1,
    ExportedWordDeprecated,
    ExportedWordV1,
} from '../types/exportedData'
import papaparse from 'papaparse'
import { Word } from '../types/word'
import { Statistics } from '../types/statistics'
import { normalizeWord } from '.'
import _ from 'lodash'

export function mapDeprecatedDataV1(
    data: ExportedWordDeprecated[]
): ExportedDataV1 {
    const words = data.map<ExportedWordV1>(
        ([native, translation, progress, info]) => ({
            native,
            translation,
            progress,
            info,
        })
    )

    return {
        version: 1,
        words,
    }
}

export function mapDataGoogleTranslateV1(csvString: string): ExportedDataV1 {
    const { data } = papaparse.parse<string[]>(csvString, {
        header: false,
    })
    const words = data.map<ExportedWordV1>((row) => {
        const [, , native, translation] = row
        return { native, translation }
    })

    return {
        version: 1,
        words,
    }
}

export function mapDataExportWords(params: {
    words: Word[]
    statistics?: Statistics[]
}): ExportedDataV1 {
    return {
        version: 1,
        words: params.words.map((word) => {
            const normalized = normalizeWord(word)
            return _.omit(normalized, ['collectionId', 'id'])
        }),
        statistics:
            params.statistics?.map((stat) => {
                return _.omit(stat, ['collectionId', 'id'])
            }) || [],
    }
}
