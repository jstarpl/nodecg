import {
  OFFSETABLE_TEMPLATES,
  REPLICANT_DEFAULTS,
} from "common/graphics/defaults";
import { ITemplate } from "common/ITemplate";
import {
  IMoveNext,
  IpcMessages,
  IRestoreEntry,
  ISetOnAir,
} from "common/playlist";
import { NodeCG } from "../../../../types/server";

export function playlist(nodecg: NodeCG) {
  function onSetOnAir({ id, template: targetTemplate, onAir }: ISetOnAir) {
    if (!REPLICANT_DEFAULTS[targetTemplate]) return;

    const repl = nodecg.Replicant(targetTemplate, {
      defaultValue: REPLICANT_DEFAULTS[targetTemplate],
      persistent: false,
    });

    if (id !== repl.value.id && id !== null) return;
    if (repl.value.onAir === onAir) return;
    repl.value = {
      ...repl.value,
      onAir,
    };
  }

  function onMoveNext({ template: targetTemplate }: IMoveNext) {
    if (!OFFSETABLE_TEMPLATES[targetTemplate]) return;
    if (!REPLICANT_DEFAULTS[targetTemplate]) return;

    const step = OFFSETABLE_TEMPLATES[targetTemplate];

    const repl = nodecg.Replicant(targetTemplate, {
      defaultValue: REPLICANT_DEFAULTS[targetTemplate],
      persistent: false,
    });

    if (repl.value.onAir !== true) return;
    if (repl.value.values.contents === undefined) return;
    if (
      (repl.value.values.offset ?? 0) + step >=
      repl.value.values.contents.length
    )
      return;

    repl.value = {
      ...repl.value,
      values: {
        ...repl.value.values,
        offset: (repl.value.values.offset ?? 0) + step,
      },
    };
  }

  function onRestore({ entry, putOnAir }: IRestoreEntry) {
    const targetTemplate = entry.template;
    if (!REPLICANT_DEFAULTS[targetTemplate]) return;

    const repl = nodecg.Replicant(targetTemplate, {
      defaultValue: REPLICANT_DEFAULTS[targetTemplate],
      persistent: false,
    });

    const newTemplate: ITemplate<any> = {
      ...repl.value,
      id: entry.id,
      //@ts-ignore The entry.values should match
      values: {
        ...entry.values,
      },
    };
    if (putOnAir) {
      newTemplate.onAir = true;
      if (newTemplate.values.offset !== undefined) {
        newTemplate.values.offset = 0;
      }
    }
    repl.value = newTemplate;
  }

  nodecg.listenFor(IpcMessages.SET_ON_AIR, onSetOnAir);
  nodecg.listenFor(IpcMessages.RESTORE_ENTRY, onRestore);
  nodecg.listenFor(IpcMessages.MOVE_NEXT, onMoveNext);

  nodecg.log.info("Playlist: initialized");
}
