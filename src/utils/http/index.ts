import { ExportedDataV1 } from '../../types/exportedData'
import { axios } from './axios'

export const StoreAPI = {
    setValue(key: string, value: ExportedDataV1) {
        return axios.post(`/api/store`, { key, value })
    },
    getValue(key: string) {
        return axios.get<ExportedDataV1>(`/api/store/${key}`)
    },
}
