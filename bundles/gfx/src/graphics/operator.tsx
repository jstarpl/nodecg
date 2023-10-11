import {
	ICommon,
	REPLICANT_NAME as COMMON_REPLICANT_NAME,
	REPLICANT_OPTIONS as COMMON_REPLICANT_OPTIONS,
} from "common/graphics/ICommon";
import { useOnlyReplicantValue, useReplicantValue } from "common/useReplicant";
import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { ReplicantOptions } from "../../../../types/browser";

import "./operator.css";

const SCORE_OCR_UPLINK_DELAY_OPTS: ReplicantOptions<number> = {
	defaultValue: 0,
};

const STRING_REPLICANT_OPTS: ReplicantOptions<string> = {
	defaultValue: "",
};

function Panel() {
	const common = useOnlyReplicantValue<ICommon>(
		COMMON_REPLICANT_NAME,
		undefined,
		COMMON_REPLICANT_OPTIONS
	);
	const score1Timeout = useRef<number | null>(null);
	const score2Timeout = useRef<number | null>(null);
	const fouls1Timeout = useRef<number | null>(null);
	const fouls2Timeout = useRef<number | null>(null);

	const uplinkDelay =
		useOnlyReplicantValue(
			"scoreboardOCR:uplinkDelay",
			undefined,
			SCORE_OCR_UPLINK_DELAY_OPTS
		) * 1000;

	const [score1, setScore1] = useReplicantValue(
		"score1",
		undefined,
		STRING_REPLICANT_OPTS
	);
	const [iScore1, setIScore1] = useState(score1);
	const [score2, setScore2] = useReplicantValue(
		"score2",
		undefined,
		STRING_REPLICANT_OPTS
	);
	const [iScore2, setIScore2] = useState(score2);

	// const [fouls1, setFouls1] = useReplicantValue(
	// 	"fouls1",
	// 	undefined,
	// 	STRING_REPLICANT_OPTS
	// );
	// const [iFouls1, setIFouls1] = useState(fouls1);
	// const [fouls2, setFouls2] = useReplicantValue(
	// 	"fouls2",
	// 	undefined,
	// 	STRING_REPLICANT_OPTS
	// );
	// const [iFouls2, setIFouls2] = useState(fouls2);

	useEffect(() => {
		setIScore1(score1);
	}, [score1]);
	useEffect(() => {
		setIScore2(score2);
	}, [score2]);
	// useEffect(() => {
	// 	setIFouls1(fouls1);
	// }, [fouls1]);
	// useEffect(() => {
	// 	setIFouls2(fouls2);
	// }, [fouls2]);

	function score1Delta(delta: number) {
		const newScore = String(Math.max(0, (Number(iScore1) || 0) + delta));
		setIScore1(newScore);
		if (score1Timeout.current !== null)
			window.clearTimeout(score1Timeout.current);
		score1Timeout.current = window.setTimeout(() => {
			setScore1(newScore);
		}, uplinkDelay);
	}

	function score2Delta(delta: number) {
		const newScore = String(Math.max(0, (Number(iScore2) || 0) + delta));
		setIScore2(newScore);
		if (score2Timeout.current !== null)
			window.clearTimeout(score2Timeout.current);
		score2Timeout.current = window.setTimeout(() => {
			setScore2(newScore);
		}, uplinkDelay);
	}

	// function fouls1Delta(delta: number) {
	// 	const newFouls = String(
	// 		Math.min(5, Math.max(0, (Number(iFouls1) || 0) + delta))
	// 	);
	// 	setIFouls1(newFouls);
	// 	if (fouls1Timeout.current !== null)
	// 		window.clearTimeout(fouls1Timeout.current);
	// 	fouls1Timeout.current = window.setTimeout(() => {
	// 		setFouls1(newFouls);
	// 	}, uplinkDelay);
	// }

	// function fouls2Delta(delta: number) {
	// 	const newFouls = String(
	// 		Math.min(5, Math.max(0, (Number(iFouls2) || 0) + delta))
	// 	);
	// 	setIFouls2(newFouls);
	// 	if (fouls2Timeout.current !== null)
	// 		window.clearTimeout(fouls2Timeout.current);
	// 	fouls2Timeout.current = window.setTimeout(() => {
	// 		setFouls2(newFouls);
	// 	}, uplinkDelay);
	// }

	const clockRunning = useOnlyReplicantValue<boolean>(
		"system:clockState",
		undefined,
		{
			defaultValue: false,
			persistent: false,
		}
	);

	function clockStart() {
		nodecg.sendMessage("system:clock:start");
	}

	function clockStop() {
		nodecg.sendMessage("system:clock:stop");
	}

	return (
		<>
			<div className="teams">
				<div className="label">Gospodarze</div>
				<div id="teamA" className="team teamA">
					{common.values.team1}
				</div>
				<div className="label">Goście</div>
				<div id="teamB" className="team teamB">
					{common.values.team2}
				</div>
			</div>
			<div className="score">
				<div className="scoreA">
					<div className="label">Gospodarze</div>
					<button id="scoreAPlus" onClick={() => score1Delta(1)}>
						+
					</button>
					<input type="text" id="scoreA" value={iScore1} readOnly />
					<button id="scoreAMinus" onClick={() => score1Delta(-1)}>
						-
					</button>
				</div>
				<div className="scoreB">
					<div className="label">Goście</div>
					<button id="scoreBPlus" onClick={() => score2Delta(1)}>
						+
					</button>
					<input type="text" id="scoreB" value={iScore2} readOnly />
					<button id="scoreBMinus" onClick={() => score2Delta(-1)}>
						-
					</button>
				</div>
			</div>
			<h2>ZEGAR</h2>
			<div className="clock">
				<button
					className={clockRunning ? "on" : ""}
					onClick={() => clockStart()}
				>
					Start
				</button>
				<button onClick={() => clockStop()}>Stop</button>
			</div>
		</>
	);
}

ReactDOM.render(<Panel />, document.getElementById("root"));
