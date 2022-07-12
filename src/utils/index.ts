import _ from "lodash";

export function getRandomValueFromArray<T>(arr: T[]): T {
    return arr[_.random(0, arr.length - 1)]
}