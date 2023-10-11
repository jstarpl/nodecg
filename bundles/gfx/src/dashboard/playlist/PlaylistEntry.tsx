import React from "react";
import { Dispatch } from "common/useReplicant";
import { SxProps, Theme } from "@mui/material";
import { PlaylistEntryBreak } from "./PlaylistEntryBreak";
import { PlaylistEntryTemplate } from "./PlaylistEntryTemplate";
import { IPlaylistAction } from "./usePlaylistInteractions";
import { IPlaylistEntry } from "common/playlist";

export enum ItemTypes {
  PLAYLIST_ENTRY = "playlist_entry",
}

export const TABLE_ROW_STYLE: SxProps<Theme> = {
  "&:not(.isOver):last-child td, &:not(.isOver):last-child th": { border: 0 },
  "&.isOver td, &.isOver th": { borderBottomColor: "#00ADEE" },
  userSelect: "none",
};

export const DRAG_HANDLE_STYLE: SxProps<Theme> = {
  cursor: "grab",
};

export function PlaylistEntry({
  entry,
  dispatch,
}: {
  entry: IPlaylistEntry;
  dispatch: Dispatch<IPlaylistAction>;
}) {
  if (entry.type === "break") {
    return <PlaylistEntryBreak entry={entry} dispatch={dispatch} />;
  }

  return <PlaylistEntryTemplate entry={entry} dispatch={dispatch} />;
}
