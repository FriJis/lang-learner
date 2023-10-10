import { colors } from '../../conf'
import { StatisticsType } from '../../types/statistics'

export const i18nCommon = {
    color: {
        [StatisticsType.addedWord]: colors.green,
        [StatisticsType.auditedText]: colors.yellow,
        [StatisticsType.learnedWord]: colors.blue,
        [StatisticsType.passedFinalTest]: colors.red,
    },
}
