import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Dispatch } from "common/useReplicant";
import { useDrag, useDrop } from "react-dnd";
import { DRAG_HANDLE_STYLE, ItemTypes, TABLE_ROW_STYLE } from "./PlaylistEntry";
import {
  IconButton,
  Input,
  TableCell,
  TableRow,
  Tooltip,
  Checkbox,
  Typography,
} from "@mui/material";
import { ArrowForward, Delete, DragHandleRounded } from "@mui/icons-material";
import { OnAirToggleButton } from "../lib/OnAirToggleButton";
import { useTemplateOnAirStatus } from "common/useTemplateOnAir";
import { IPlaylistAction } from "./usePlaylistInteractions";
import { IpcMessages, IPlaylistEntryTemplate } from "common/playlist";

function valuesSummary(values: Record<string, any>): string {
  return Object.entries(values)
    .filter(([key, value]) => key !== "location" && key !== "date")
    .map(([key, value]) => value)
    .filter(Boolean)
    .join(", ");
}

const nodecg = window.nodecg

export function PlaylistEntryTemplate({
  entry,
  dispatch,
}: {
  entry: IPlaylistEntryTemplate;
  dispatch: Dispatch<IPlaylistAction>;
}) {
  const element = useRef<HTMLTableRowElement | null>(null);
  const isOnAir = useTemplateOnAirStatus(
    entry.template,
    entry.useCurrentValues ? null : entry.id
  );

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

  function onDelete() {
    dispatch({
      action: "DELETE",
      id: entry.id,
    });
  }

  function onLoad() {
    nodecg.sendMessage(IpcMessages.RESTORE_ENTRY, { entry });
  }

  function onPlay() {
    const shouldBeOnAir = !isOnAir;
    if (entry.useCurrentValues) {
      nodecg.sendMessage(IpcMessages.SET_ON_AIR, {
        id: null,
        template: entry.template,
        onAir: shouldBeOnAir,
      });
      return;
    }

    if (shouldBeOnAir) {
      nodecg.sendMessage(IpcMessages.RESTORE_ENTRY, { entry, putOnAir: true });
    } else {
      nodecg.sendMessage(IpcMessages.SET_ON_AIR, {
        id: entry.id,
        template: entry.template,
        onAir: shouldBeOnAir,
      });
    }
  }

  useLayoutEffect(() => {
    if (!element.current) return;
    element.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, []);

  const [useCurrentValues, _setUseCurrentValues] = useState(
    entry.useCurrentValues ?? false
  );

  function setUseCurrentValues(value: boolean): void {
    entry.useCurrentValues = value;
    _setUseCurrentValues(value);
  }

  const summary = valuesSummary(entry.values);

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
      <TableCell component="th" scope="row" sx={{ fontWeight: "bolder" }}>
        {entry.name}
      </TableCell>
      <TableCell>
        <Input
          disableUnderline
          placeholder="Komentarz"
          fullWidth
          defaultValue={entry.comment || ""}
          onChange={(e) => (entry.comment = e.target.value)}
          sx={{ fontStyle: "italic" }}
        />
      </TableCell>
      <TableCell>
        <Tooltip title="Użyj bieżących danych szablonu">
          <Checkbox
            defaultChecked={useCurrentValues ?? false}
            onChange={(e) => setUseCurrentValues(e.target.checked)}
          />
        </Tooltip>
      </TableCell>
      <TableCell
        sx={{
          textOverflow: "ellipsis",
          overflow: "hidden",
          maxWidth: 0,
          whiteSpace: "nowrap",
        }}
      >
        {useCurrentValues ? (
          <Typography
            variant="body1"
            sx={{
              color: "text.secondary",
              fontStyle: "italic",
            }}
          >
            Używa bieżących danych
          </Typography>
        ) : (
          <Tooltip title={summary}>
            <span>{summary}</span>
          </Tooltip>
        )}
      </TableCell>
      <TableCell align="left">
        <Tooltip title="Usuń" enterDelay={1000}>
          <IconButton aria-label="Delete" onClick={onDelete}>
            <Delete />
          </IconButton>
        </Tooltip>
        <Tooltip title="Załaduj" enterDelay={1000}>
          <IconButton aria-label="Load" onClick={onLoad}>
            <ArrowForward />
          </IconButton>
        </Tooltip>
      </TableCell>
      <TableCell align="center">
        <OnAirToggleButton onAir={isOnAir} iconOnly={true} onClick={onPlay} />
      </TableCell>
    </TableRow>
  );
}
