import { NodeCG } from "../../../../build-types/types/nodecg";

export function optsHasOptions<T>(opts: NodeCG.Replicant.Options<T>): opts is NodeCG.Replicant.OptionsWithDefault<T> {
    if ((opts as any)['defaultValue'] !== undefined) return true
    return false
}

export function getDefaultValue<T>(opts: NodeCG.Replicant.Options<T>): T | undefined {
    let defaultValue: T | undefined = undefined
    if (optsHasOptions(opts)) {
        defaultValue = opts.defaultValue
    }
    return defaultValue
}