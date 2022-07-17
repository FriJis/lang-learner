import useLocalStorageState from 'use-local-storage-state'

export const useLS = <T>(conf: { name: string; def: T }) =>
    useLocalStorageState(conf.name, { defaultValue: conf.def })
