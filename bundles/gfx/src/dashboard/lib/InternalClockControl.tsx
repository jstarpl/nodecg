import React from "react";
import {
	PlayCircleOutline,
	ReplayCircleFilledOutlined,
	Add,
	Remove,
	Scoreboard,
	StopCircleOutlined,
} from "@mui/icons-material";
import { Badge, Grid, IconButton, TextField, Tooltip } from "@mui/material";
import { useOnlyReplicantValue, useReplicantValue } from "common/useReplicant";

export function InternalClockControl({ showNudge }: { showNudge?: boolean }) {
	const [clock, setClock] = useReplicantValue<string>("clock", undefined, {
		defaultValue: "",
	});
	const clockRunning = useOnlyReplicantValue<boolean>(
		"system:clockState",
		undefined,
		{
			defaultValue: false,
		}
	);
	const scoreOCRConnected = useOnlyReplicantValue<number>(
		"system:scoreboardOCRStatus",
		undefined,
		{
			defaultValue: 0,
		}
	);

	function onClockStart() {
		nodecg.sendMessage("system:clock:start");
	}

	function onClockStop() {
		nodecg.sendMessage("system:clock:stop");
	}

	function onClockReset() {
		nodecg.sendMessage("system:clock:reset");
	}

	function onClockNudgeBackward() {
		nodecg.sendMessage("system:clock:nudge", -500);
	}

	function onClockNudgeForward() {
		nodecg.sendMessage("system:clock:nudge", 500);
	}

	return (
		<>
			<Grid item xs>
				<TextField
					id="clock"
					label="Zegar"
					size="small"
					fullWidth
					value={clock}
					onChange={(e) => setClock(e.target.value)}
				/>
			</Grid>
			<Grid item xs="auto">
				<Tooltip title="Zegar start">
					<IconButton
						color={clockRunning ? "success" : undefined}
						onClick={onClockStart}
					>
						<PlayCircleOutline />
					</IconButton>
				</Tooltip>
				<Tooltip title="Zegar stop">
					<IconButton
						color={!clockRunning ? "secondary" : undefined}
						onClick={onClockStop}
					>
						<StopCircleOutlined />
					</IconButton>
				</Tooltip>
				<Tooltip title="Zegar reset">
					<IconButton onClick={onClockReset}>
						<ReplayCircleFilledOutlined />
					</IconButton>
				</Tooltip>
				{showNudge ? (
					<>
						<Tooltip title="Zegar do tyłu">
							<IconButton onClick={onClockNudgeBackward}>
								<Remove />
							</IconButton>
						</Tooltip>
						<Tooltip title="Zegar do przodu">
							<IconButton onClick={onClockNudgeForward}>
								<Add />
							</IconButton>
						</Tooltip>
					</>
				) : null}
				<Tooltip
					title={
						scoreOCRConnected > 0
							? "Scoreboard OCR połączony"
							: "Brak Scoreboard OCR"
					}
				>
					<Badge
						color="success"
						invisible={scoreOCRConnected < 1}
						variant="dot"
						sx={{ mx: 2 }}
					>
						<Scoreboard
							color={scoreOCRConnected < 1 ? "disabled" : "inherit"}
						/>
					</Badge>
				</Tooltip>
			</Grid>
		</>
	);
}
