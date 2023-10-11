import { useEffect } from "react";
import { ITemplate } from "common/ITemplate";
import hyperid from "common/fastId";
import { IpcMessages, IPlaylistEntry } from "common/playlist";

const getId = hyperid();

export type IPlaylist = IPlaylistEntry[];

export type IPlaylistAction =
  | {
      action: "SET";
      value: IPlaylist;
    }
  | {
      action: "INSERT_AFTER";
      afterId: string;
      id: string;
    }
  | {
      action: "DELETE";
      id: string;
    }
  | {
      action: "ADD";
      entry: IPlaylistEntry;
    }
  | {
      action: "COMMENT";
      id: string;
      comment: string;
    };

export function usePlaylistInteractions(
	replicantName: string,
	templateName: string,
	template: ITemplate<any>
) {
	function onSave() {
		nodecg.sendMessage(IpcMessages.PLAYLIST_ADD, {
			id: getId(),
			type: "template",
			name: templateName,
			template: replicantName,
			values: Object.assign({}, template.values),
		});
	}

	return { onSave };
}
