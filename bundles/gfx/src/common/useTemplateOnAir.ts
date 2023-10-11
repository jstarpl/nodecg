import { useState, useMemo, useEffect } from "react";
import { REPLICANT_DEFAULTS } from "./graphics/defaults";
import { ITemplate } from "./ITemplate";
import { DEFAULT_NAMESPACE } from "./defaultNamespace";

const nodecg = window.nodecg;

export function useTemplateOnAirStatus(name: string, id: string | null) {
  const replicant = useMemo(
    () =>
      nodecg.Replicant<ITemplate<any>>(name, DEFAULT_NAMESPACE, {
        defaultValue: REPLICANT_DEFAULTS[name],
      }),
    [name]
  );
  const [onAir, setOnAir] = useState(false);

  useEffect(() => {
    const listener = (newVal: ITemplate<any> | undefined) => {
      if (newVal === undefined) return
      setOnAir(newVal.onAir && (newVal.id === id || id === null));
    };
    replicant.on("change", listener);
    return () => {
      replicant.removeListener("change", listener);
    };
  }, [name, id]);

  return onAir;
}
