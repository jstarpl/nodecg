import { useCallback, useMemo, useRef, useSyncExternalStore } from "react";
import NodeCG from "@nodecg/types";
import { DEFAULT_NAMESPACE } from "./defaultNamespace";
import { getDefaultValue } from "./utils";

const nodecg = window.nodecg;

function valueClone<T>(value: T): T {
  if (value === null) {
    return null as T
  } else if (typeof value === "object" && value !== null) {
    if (Array.isArray(value)) {
      return ([] as any[]).concat(value) as T
    } else {
      return Object.assign({}, value)
    }
  } else {
    return value
  }
}

export function useOnlyReplicantValue<T>(
  name: string,
  opts?: NodeCG.Replicant.OptionsNoDefault
): T | undefined
export function useOnlyReplicantValue<T>(
  name: string,
  opts: NodeCG.Replicant.OptionsWithDefault<T>
): T
export function useOnlyReplicantValue<T>(
  name: string,
  opts: NodeCG.Replicant.Options<T> = {}
): T | undefined {
  const replicant = useMemo(
    () =>
      nodecg.Replicant<T>(name, DEFAULT_NAMESPACE, opts),
    [name, opts]
  );
  const snapshot = useRef<T | undefined>(replicant.value);
  const subscribe = useCallback((onStoreChange: () => void) => {
    function onChange(newVal: T | undefined) {
      snapshot.current = valueClone(newVal)
      onStoreChange()
    }
    replicant.addListener('change', onChange)

    return () => {
      replicant.removeListener('change', onChange)
    }
  }, [snapshot, replicant])
  const getSnapshot = useCallback(() => {
    return snapshot.current
  }, [snapshot])
  const defaultValue = getDefaultValue(opts)
  return useSyncExternalStore(subscribe, getSnapshot) ?? defaultValue
}

export function useReplicantValue<T>(
  name: string,
  opts?: NodeCG.Replicant.OptionsNoDefault
): readonly [T | undefined, (val: T) => void]
export function useReplicantValue<T>(
  name: string,
  opts: NodeCG.Replicant.OptionsWithDefault<T>
): readonly [T, (val: T) => void]
export function useReplicantValue<T>(
  name: string,
  opts: NodeCG.Replicant.Options<T> = {}
): readonly [T | undefined, (val: T) => void] {
  const replicant = useMemo(
    () =>
      nodecg.Replicant<T>(name, DEFAULT_NAMESPACE, opts),
    [name, opts]
  );
  const snapshot = useRef<T | undefined>(replicant.value);
  const subscribe = useCallback((onStoreChange: () => void) => {
    function onChange(newVal: T | undefined) {
      snapshot.current = valueClone(newVal)
      onStoreChange()
    }
    replicant.addListener('change', onChange)

    return () => {
      replicant.removeListener('change', onChange)
    }
  }, [snapshot, replicant])
  const getSnapshot = useCallback(() => {
    return snapshot.current
  }, [snapshot])
  const defaultValue = getDefaultValue(opts)
  const value = useSyncExternalStore(subscribe, getSnapshot) ?? defaultValue
  const setValue = useCallback((newVal: T) => {
    replicant.value = newVal
  }, [replicant])
  return [value, setValue] as const;
}

export type Dispatch<K> = (action: K) => void;

export function useReplicantWithReducer<T, K = any>(
  name: string,
  reducer: (prevState: T, action: K) => T,
  opts: NodeCG.Replicant.OptionsWithDefault<T>
): readonly [T, Dispatch<K>] {
  const reducerRef = useRef(reducer);
  const replicant = useMemo(
    () =>
      nodecg.Replicant<T>(name, DEFAULT_NAMESPACE, opts),
    [name, opts]
  );
  const snapshot = useRef<T | undefined>(replicant.value);
  const subscribe = useCallback((onStoreChange: () => void) => {
    function onChange(newVal: T | undefined) {
      snapshot.current = valueClone(newVal)
      onStoreChange()
    }
    replicant.addListener('change', onChange)

    return () => {
      replicant.removeListener('change', onChange)
    }
  }, [snapshot, replicant])
  const getSnapshot = useCallback(() => {
    return snapshot.current ?? opts.defaultValue
  }, [snapshot, opts.defaultValue])
  const value = useSyncExternalStore(subscribe, getSnapshot)
  const dispatch = useCallback(
    (action: K) => {
      replicant.value = reducerRef.current(
        replicant.value ?? opts.defaultValue,
        action
      );
    },
    [replicant]
  );
  return [value, dispatch] as const;
}

export function useReplicantDerivedValue<T, K>(
  name: string,
  computation: (state: T | undefined) => K,
  opts: NodeCG.Replicant.OptionsWithDefault<T>
): K | undefined {
  const computationRef = useRef(computation);
  const replicant = useMemo(
    () =>
      nodecg.Replicant<T>(name, DEFAULT_NAMESPACE, opts),
    [name, opts]
  );
  const snapshot = useRef<K | undefined>(computationRef.current(replicant.value));
  const subscribe = useCallback((onStoreChange: () => void) => {
    const computationFunction = computationRef.current
    function onChange(newVal: T | undefined) {
      snapshot.current = valueClone(computationFunction(newVal))
      onStoreChange()
    }
    replicant.addListener('change', onChange)

    return () => {
      replicant.removeListener('change', onChange)
    }
  }, [snapshot, replicant])
  const getSnapshot = useCallback(() => {
    return snapshot.current
  }, [snapshot])
  const value = useSyncExternalStore(subscribe, getSnapshot)
  return value;
}
