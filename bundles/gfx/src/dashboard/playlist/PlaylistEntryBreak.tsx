import React, { useLayoutEffect, useMemo, useRef } from "react";
import { Dispatch } from "common/useReplicant";
import { useDrag, useDrop } from "react-dnd";
import { DRAG_HANDLE_STYLE, ItemTypes, TABLE_ROW_STYLE } from "./PlaylistEntry";
import { IconButton, TableCell, TableRow, Tooltip } from "@mui/material";
import { Delete, DragHandleRounded } from "@mui/icons-material";
import { IPlaylistAction } from "./usePlaylistInteractions";
import { IPlaylistEntryBreak } from "common/playlist";

export function PlaylistEntryBreak({
  entry,
  dispatch,
}: {
  entry: IPlaylistEntryBreak;
  dispatch: Dispatch<IPlaylistAction>;
}) {
  const element = useRef<HTMLTableRowElement | null>(null);
  const [{ isDragging }, drag, preview] = useDrag(
    () => ({
      type: ItemTypes.PLAYLIST_ENTRY,
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
      item: { id: entry.id },
    }),
    [entry.id]
  );

  const [{ canDrop, isOver }, drop] = useDrop(
    () => ({
      accept: ItemTypes.PLAYLIST_ENTRY,
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
      drop: (droppedItem, monitor) => {
        dispatch({
          action: "INSERT_AFTER",
          afterId: entry.id,
          id: (droppedItem as any).id,
        });
      },
    }),
    [entry.id, dispatch]
  );

  const dropAndPreview = useMemo<React.Ref<HTMLTableRowElement>>(() => {
    return (el) => {
      element.current = el;
      preview(el);
      drop(el);
    };
  }, [preview, drop]);

  useLayoutEffect(() => {
    if (!element.current) return;
    element.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, []);

  function onDelete() {
    dispatch({
      action: "DELETE",
      id: entry.id,
    });
  }

  return (
    <TableRow
      ref={dropAndPreview}
      className={isOver ? "isOver" : undefined}
      key={entry.id}
      sx={TABLE_ROW_STYLE}
    >
      <TableCell ref={drag} sx={DRAG_HANDLE_STYLE}>
        <DragHandleRounded />
      </TableCell>
      <TableCell colSpan={4}>
        <hr
          style={{
            border: "none",
            borderTop: "1px solid #555",
          }}
        />
      </TableCell>
      <TableCell align="left">
        <Tooltip title="Usuń" enterDelay={1000}>
          <IconButton aria-label="Delete" onClick={onDelete}>
            <Delete />
          </IconButton>
        </Tooltip>
      </TableCell>
      <TableCell align="center"></TableCell>
    </TableRow>
  );
}
