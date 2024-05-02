import Axios from 'axios'
import { lsConf } from '../../conf'
Axios.defaults.baseURL = ''
const a = Axios

a.interceptors.request.use(
    (req) => {
        req.baseURL = JSON.parse(
            localStorage.getItem(lsConf.serverName.name) || ''
        )
        req.headers.Authorization = `Basic ${JSON.parse(
            localStorage.getItem(lsConf.serverPassword.name) || ''
        )}`

        return req
    },
    (err) => {
        return err
    }
)

export const axios = a
