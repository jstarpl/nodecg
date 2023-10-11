import { ITemplate } from "./ITemplate";

export enum IpcMessages {
  PLAYLIST_ADD = "dashboard:playlist:add",
  RESTORE_ENTRY = "dashboard:restoreEntry",
  SET_ON_AIR = "dashboard:setOnAir",
  MOVE_NEXT = "dashboard:moveNext",
}

export type IMoveNext = {
  template: string;
};

export type ISetOnAir = {
  id: string | null;
  template: string;
  onAir: boolean;
};

export type IRestoreEntry = {
  entry: IPlaylistEntryTemplate;
  putOnAir?: boolean;
};

export type IPlaylistEntryBreak = {
  id: string;
  type: "break";
};

export type IPlaylistEntryTemplate = {
  id: string;
  type: "template";
  name: string;
  comment?: string;
  template: string;
  values: ITemplate<any>["values"];
  useGlobalValues: boolean;
  useCurrentValues: boolean;
};

export type IPlaylistEntry = IPlaylistEntryBreak | IPlaylistEntryTemplate;
