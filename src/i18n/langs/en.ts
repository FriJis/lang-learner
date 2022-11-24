import { StatisticsType } from '../../types/statistics'
import { i18nCommon } from './common'

export const i18nEn = {
    ...i18nCommon,
    stats: {
        [StatisticsType.addedWord]: 'Added new words',
        [StatisticsType.auditedText]: 'Audited texts',
        [StatisticsType.learnedWord]: 'Learned words',
        [StatisticsType.passedFinalTest]: 'Passed final test words',
    },
}
