import React, { useEffect } from "react";
import ReactDOM from "react-dom";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

import { useReplicantWithReducer } from "common/useReplicant";
import {
  Box,
  Button,
  Grid,
  IconButton,
  ThemeProvider,
  Tooltip,
} from "@mui/material";
import { nodeCGTheme } from "./lib/nodecg.mui.theme";
import hyperid from "common/fastId";
import { Add, FolderOpen, InsertDriveFile, Save } from "@mui/icons-material";

import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { PlaylistEntry } from "./playlist/PlaylistEntry";
import { IPlaylist, IPlaylistAction } from "./playlist/usePlaylistInteractions";
import { IpcMessages, IPlaylistEntry } from "common/playlist";

const getId = hyperid();
const nodecg = window.nodecg;

function deserializePlaylist(text: string): IPlaylist {
  const data = JSON.parse(text);
  if (data.version !== "1" || !Array.isArray(data.playlist))
    throw new Error("Unknown file format");
  return data.playlist;
}

function serializePlaylist(playlist: IPlaylist): string {
  const fileObject = {
    version: "1",
    playlist: playlist,
  };
  return JSON.stringify(fileObject);
}

function playlistReducer(
  prevState: IPlaylist,
  action: IPlaylistAction
): IPlaylist {
  switch (action.action) {
    case "SET": {
      return [...action.value];
    }
    case "INSERT_AFTER": {
      const flatPrevState = Array.from(prevState);
      const item = Object.assign(
        {},
        flatPrevState.find((entry) => entry.id === action.id)
      );
      if (!item) {
        console.error(`Could not find item "${action.id}"`);
        return prevState;
      }
      const newState = flatPrevState.filter((entry) => entry.id !== action.id);
      const afterIndex = newState.findIndex(
        (entry) => entry.id === action.afterId
      );
      if (afterIndex < 0) {
        console.error(`Could not find target item "${action.afterId}"`);
        return prevState;
      }
      newState.splice(afterIndex + 1, 0, item);
      return newState;
    }
    case "DELETE": {
      return Array.from(prevState).filter((entry) => entry.id !== action.id);
    }
    case "ADD": {
      const flatPrevState = Array.from(prevState);
      flatPrevState.push(action.entry);
      return flatPrevState;
    }
  }
  console.log(`playlistReducer: Unknown action: ${JSON.stringify(action)}`);
  return prevState;
}

function Dashboard() {
  const [playlist, dispatch] = useReplicantWithReducer<
    IPlaylist,
    IPlaylistAction
  >("playlist", playlistReducer, {
    defaultValue: [],
  });

  useEffect(() => {
    function onPlaylistAdd(entry: IPlaylistEntry) {
      dispatch({
        action: "ADD",
        entry,
      });
    }

    nodecg.listenFor(IpcMessages.PLAYLIST_ADD, onPlaylistAdd);

    return () => {
      nodecg.unlisten(IpcMessages.PLAYLIST_ADD, onPlaylistAdd);
    };
  }, [dispatch]);

  function onAddSeparator() {
    dispatch({
      action: "ADD",
      entry: {
        id: getId(),
        type: "break",
      },
    });
  }

  function onNewPlaylist() {
    dispatch({
      action: "SET",
      value: [],
    });
  }

  function onOpen(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      file.text().then((text) => {
        dispatch({
          action: "SET",
          value: deserializePlaylist(text),
        });
      });
    }
    // @ts-expect-error 2322
    e.target.value = null;
  }

  function onSave() {
    function createFileName() {
      let fileName = "Szablon ";
      fileName += window.location.host + " ";
      fileName += new Date().toISOString();
      fileName += ".json";
      return fileName;
    }

    const a = document.createElement("a");
    document.body.appendChild(a);
    a.style.display = "none";
    const json = serializePlaylist(playlist),
      blob = new Blob([json], { type: "application/json" }),
      url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = createFileName();
    a.click();
    window.URL.revokeObjectURL(url);
  }

  return (
		<DndProvider backend={HTML5Backend}>
			<ThemeProvider theme={nodeCGTheme}>
				<TableContainer component={Paper} sx={{ maxHeight: "600px" }}>
					<Table
						stickyHeader
						sx={{ minWidth: 650 }}
						aria-label="Szpigiel"
						size="small"
					>
						<TableHead>
							<TableRow>
								<TableCell sx={{ width: "2em" }}></TableCell>
								<TableCell sx={{ width: "7em" }}>Szablon</TableCell>
								<TableCell sx={{ width: "12em" }}></TableCell>
								<TableCell sx={{ width: "2em" }}></TableCell>
								<TableCell>Dane</TableCell>
								<TableCell sx={{ width: "6em" }}></TableCell>
								<TableCell sx={{ width: "3em" }}></TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{playlist.map((entry) => (
								<PlaylistEntry
									key={entry.id}
									entry={entry}
									dispatch={dispatch}
								/>
							))}
							{playlist.length === 0 && (
								<TableRow
									sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
								>
									<TableCell align="center" colSpan={5}>
										<Box
											sx={{
												color: "text.secondary",
												fontStyle: "italic",
												textAlign: "center",
												m: 1,
											}}
										>
											Pusta
										</Box>
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</TableContainer>
				<Grid container spacing={0}>
					<Grid item sx={{ m: 2 }} xs>
						<Button startIcon={<Add />} onClick={onAddSeparator}>
							Separator
						</Button>
					</Grid>
					<Grid item sx={{ m: 2, textAlign: "right" }} xs>
						<Tooltip title="Nowy" enterDelay={1000}>
							<IconButton
								color="secondary"
								aria-label="Nowy"
								onClick={onNewPlaylist}
							>
								<InsertDriveFile />
							</IconButton>
						</Tooltip>
						<Tooltip title="Otwórz" enterDelay={1000}>
							<IconButton
								color="secondary"
								aria-label="Otwórz"
								component="label"
							>
								<FolderOpen />
								<input
									hidden
									accept="application/json"
									type="file"
									onChange={onOpen}
								/>
							</IconButton>
						</Tooltip>
						<Tooltip title="Zapisz" enterDelay={1000}>
							<IconButton
								color="secondary"
								aria-label="Zapisz"
								onClick={onSave}
							>
								<Save />
							</IconButton>
						</Tooltip>
					</Grid>
				</Grid>
			</ThemeProvider>
		</DndProvider>
	);
}

ReactDOM.render(<Dashboard />, document.getElementById("root"));
