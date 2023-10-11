import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import "./Combo.css";
import { useOnlyReplicantValue } from "common/useReplicant";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import {
	IScoreBug,
	REPLICANT_NAME,
	REPLICANT_OPTIONS,
} from "common/graphics/IScoreBug";
import Score_Clock from "./COMBO_TOP_F1300.webm";
import WScore_Clock from "./W.COMBO_TOP_F1300.avi.webm";
import Karne_Clock from "./KARNE_COMBO_F580.avi.webm";
import { PausingVideo } from "../components/PausingVideo";
import {
	ICommon,
	REPLICANT_NAME as COMMON_REPLICANT_NAME,
	REPLICANT_OPTIONS as COMMON_REPLICANT_OPTIONS,
} from "common/graphics/ICommon";
import { FitText } from "../components/FitText";
import {
	useDebouncedLeadingEdgeState,
	useDebouncedState,
} from "common/useDebouncedState";
import { useType } from "../lib/lib";

function animateScore(elem: HTMLDivElement) {
	elem.classList.remove("run-animation");
	void elem.offsetWidth;
	elem.classList.add("run-animation");
	return () => {
		elem.classList.remove("run-animation");
	};
}

function penaltyToClass(val: string): string {
	switch (val) {
		case "X":
			return "green";
		case "O":
			return "red";
	}
	return "";
}

export function Combo() {
	const score1Anim = useRef<HTMLDivElement>(null);
	const score2Anim = useRef<HTMLDivElement>(null);

	const template = useOnlyReplicantValue<IScoreBug>(
		REPLICANT_NAME,
		REPLICANT_OPTIONS
	);

	const common = useOnlyReplicantValue<ICommon>(
		COMMON_REPLICANT_NAME,
		COMMON_REPLICANT_OPTIONS
	);

	const type = useType();

	// const comboPlayer = useOnlyReplicantValue<IComboPlayer>(
	// 	COMBO_PLAYER_NAME,
	// 	undefined,
	// 	COMBO_PLAYER_OPTIONS
	// );

	const liveScore1 = useOnlyReplicantValue("score1", {
		defaultValue: "",
	});
	const liveScore2 = useOnlyReplicantValue("score2", {
		defaultValue: "",
	});

	const onOff = template.onAir ? "on" : "off";

	const onScore1Update = useCallback((newVal: string, oldVal: string) => {
		if (!score1Anim.current || parseFloat(newVal) <= parseFloat(oldVal)) return;
		return animateScore(score1Anim.current);
	}, []);

	const onScore2Update = useCallback((newVal: string, oldVal: string) => {
		if (!score2Anim.current || parseFloat(newVal) <= parseFloat(oldVal)) return;
		return animateScore(score2Anim.current);
	}, []);

	const score1 = useDebouncedLeadingEdgeState(
		liveScore1,
		1000,
		liveScore1,
		onScore1Update
	);
	const score2 = useDebouncedLeadingEdgeState(
		liveScore2,
		1000,
		liveScore2,
		onScore2Update
	);

	const padScore1 = String(score1).padStart(2, "0");
	const padScore2 = String(score2).padStart(2, "0");

	const clock = useOnlyReplicantValue("clock", {
		defaultValue: "",
	});

	const fouls1 = useOnlyReplicantValue("fouls1", {
		defaultValue: "",
	});
	const fouls2 = useOnlyReplicantValue("fouls2", {
		defaultValue: "",
	});

	const timeout11 = useOnlyReplicantValue("timeout11", {
		defaultValue: "",
	});
	const timeout12 = useOnlyReplicantValue("timeout12", {
		defaultValue: "",
	});
	const timeout13 = useOnlyReplicantValue("timeout13", {
		defaultValue: "",
	});
	const timeout21 = useOnlyReplicantValue("timeout21", {
		defaultValue: "",
	});
	const timeout22 = useOnlyReplicantValue("timeout22", {
		defaultValue: "",
	});
	const timeout23 = useOnlyReplicantValue("timeout23", {
		defaultValue: "",
	});

	const timeout11Ref = useRef<HTMLDivElement>(null);
	const timeout12Ref = useRef<HTMLDivElement>(null);
	const timeout13Ref = useRef<HTMLDivElement>(null);
	const timeout21Ref = useRef<HTMLDivElement>(null);
	const timeout22Ref = useRef<HTMLDivElement>(null);
	const timeout23Ref = useRef<HTMLDivElement>(null);

	const timeout11Show = timeout11.trim() !== "";
	const timeout12Show = timeout12.trim() !== "";
	const timeout13Show = timeout13.trim() !== "";
	const timeout21Show = timeout21.trim() !== "";
	const timeout22Show = timeout22.trim() !== "";
	const timeout23Show = timeout23.trim() !== "";

	const clockParts = clock.split(":");
	const minutes = String(clockParts[0] ?? "0").padStart(2, "0");
	const seconds = String(clockParts[1] ?? "0").padStart(2, "0");

	const showClock = !template.values.hideClock;

	const [bkgStep, setBkgStep] = useState(-1);
	useEffect(() => {
		if (onOff === "on") {
			setBkgStep(0);
		} else {
			setBkgStep(1);
		}
	}, [onOff]);

	const [penaltiesStep, setPenaltiesStep] = useState(-1);
	useEffect(() => {
		if (onOff === "on" && template.values.showPenalties) {
			const t = setTimeout(() => {
				setPenaltiesStep(0);
			}, 250);
			return () => {
				clearTimeout(t);
			};
		} else {
			setPenaltiesStep(1);
		}
	}, [onOff, template.values.showPenalties]);

	const flagStyle1 = useMemo<React.CSSProperties>(
		() => ({
			backgroundColor: common.values.color1 ?? "#ff0000",
		}),
		[common.values.color1]
	);
	const flagStyle2 = useMemo<React.CSSProperties>(
		() => ({
			backgroundColor: common.values.color2 ?? "#0000ff",
		}),
		[common.values.color2]
	);

	const flagTextColor1 = useMemo(
		() =>
			pickTextColorBasedOnBgColorAdvanced(
				common.values.color1 ?? "#ff0000",
				"light",
				"dark"
			),
		[common.values.color1]
	);
	const flagTextColor2 = useMemo(
		() =>
			pickTextColorBasedOnBgColorAdvanced(
				common.values.color2 ?? "#0000ff",
				"light",
				"dark"
			),
		[common.values.color2]
	);

	const livePenalties1 = useOnlyReplicantValue("penalties1", {
		defaultValue: "-----",
	});
	const livePenalties2 = useOnlyReplicantValue("penalties2", {
		defaultValue: "-----",
	});

	const penalties1 = useDebouncedState(livePenalties1, 1000, livePenalties1);
	const penalties2 = useDebouncedState(livePenalties2, 1000, livePenalties2);

	return (
		<div id="combo" className={onOff}>
			<div className="combo_container">
				{/* Wizytówka przy Combo na razie nie używana */}
				{/* <div className="combo_nameStrap">
					<div className="combo_Logo"></div>
					<div className="combo_name">R. Marcinkowski</div>
					<div className="combo_statsRow">
						<div className="combo_stats_category_container">
							<div className="combo_stats_category">GOLE</div>
							<div className="combo_stats_digits">33</div>
						</div>
						<div className="combo_stats_category_container">
							<div className="combo_stats_category">PRÓBY</div>
							<div className="combo_stats_digits">55</div>
						</div>
						<div className="combo_stats_category_container">
							<div className="combo_stats_category">SKUTECZNOŚĆ</div>
							<div className="combo_stats_digits">66%</div>
						</div>
					</div>
				</div> */}

				<div className="combo_downRow">
					<div className="combo_bottom_second">
						<div className="combo_bottom_clocksA">
							<TransitionGroup component={null}>
								{timeout11Show ? (
									<CSSTransition
										nodeRef={timeout11Ref}
										timeout={200}
										classNames="smallClock"
									>
										<div ref={timeout11Ref} className="combo_bottom_smallClock">
											{timeout11}
										</div>
									</CSSTransition>
								) : null}
								{timeout12Show ? (
									<CSSTransition
										nodeRef={timeout12Ref}
										timeout={200}
										classNames="smallClock"
									>
										<div ref={timeout12Ref} className="combo_bottom_smallClock">
											{timeout12}
										</div>
									</CSSTransition>
								) : null}
								{timeout13Show ? (
									<CSSTransition
										in={timeout13Show}
										nodeRef={timeout13Ref}
										timeout={200}
										classNames="smallClock"
									>
										<div ref={timeout13Ref} className="combo_bottom_smallClock">
											{timeout13}
										</div>
									</CSSTransition>
								) : null}
							</TransitionGroup>
						</div>
						<div className="combo_bottom_clocksB">
							<TransitionGroup component={null}>
								{timeout21Show ? (
									<CSSTransition
										nodeRef={timeout21Ref}
										timeout={200}
										classNames="smallClock"
									>
										<div ref={timeout21Ref} className="combo_bottom_smallClock">
											{timeout21}
										</div>
									</CSSTransition>
								) : null}
								{timeout22Show ? (
									<CSSTransition
										nodeRef={timeout22Ref}
										timeout={200}
										classNames="smallClock"
									>
										<div ref={timeout22Ref} className="combo_bottom_smallClock">
											{timeout22}
										</div>
									</CSSTransition>
								) : null}
								{timeout23Show ? (
									<CSSTransition
										nodeRef={timeout23Ref}
										timeout={200}
										classNames="smallClock"
									>
										<div ref={timeout23Ref} className="combo_bottom_smallClock">
											{timeout23}
										</div>
									</CSSTransition>
								) : null}
							</TransitionGroup>
						</div>
					</div>
					<div className={`combo_bottom_first ${showClock ? "on" : "off"}`}>
						<div className="combo_bottom_leftEmptyGoal"></div>
						<div className="combo_clock">
							<div className="combo_clock_bkg"></div>
							<div className="combo_clock_minutes">{minutes}</div>
							<div className="combo_clock_separator">:</div>
							<div className="combo_clock_seconds">{seconds}</div>
						</div>
						<div className="combo_bottom_rightEmptyGoal"></div>
					</div>
				</div>

				<div className="combo_layer_2"></div>

				<div
					className={`combo_penalties_layer ${
						template.values.showPenalties ? "show" : "hide"
					}`}
				>
					<div className="combo_circlesA">
						{[0, 1, 2, 3, 4].map((num) => (
							<div
								className={`combo_circle ${penaltyToClass(penalties1[num])}`}
								key={num}
							></div>
						))}
					</div>
					<div className="combo_circlesB">
						{[0, 1, 2, 3, 4].map((num) => (
							<div
								className={`combo_circle ${penaltyToClass(penalties2[num])}`}
								key={num}
							></div>
						))}
					</div>
				</div>

				<div className="combo_centerRow combo_teamNames">
					<div className="combo_teamsNameA">
						<FitText width={110} align="center">
							{common.values.shortName1}
						</FitText>
					</div>
					<div className="combo_teamsScoreA"></div>
					<div className="combo_logo"></div>
					<div className="combo_teamsScoreB"></div>
					<div className="combo_teamsNameB">
						<FitText width={110} align="center">
							{common.values.shortName2}
						</FitText>
					</div>
				</div>

				<div className="combo_goal_flags">
					<div
						className={`combo_goalFlagA ${flagTextColor1}`}
						style={flagStyle1}
						ref={score1Anim}
					></div>
					<div
						className={`combo_goalFlagB ${flagTextColor2}`}
						style={flagStyle2}
						ref={score2Anim}
					></div>
				</div>

				<div className="combo_layer_1">
					{type === "men" ? (
						<PausingVideo
							src={Score_Clock}
							width={669}
							height={101}
							muted
							steps={[1300]}
							step={bkgStep}
						/>
					) : (
						<PausingVideo
							src={WScore_Clock}
							width={669}
							height={101}
							muted
							steps={[1300]}
							step={bkgStep}
						/>
					)}
				</div>

				<div className="combo_centerRow combo_score">
					<div className="combo_teamsNameA"></div>
					<div className="combo_teamsScoreA">
						<FitText width={100} align="center">
							{padScore1}
						</FitText>
					</div>
					<div className="combo_logo"></div>
					<div className="combo_teamsScoreB">
						<FitText width={100} align="center">
							{padScore2}
						</FitText>
					</div>
					<div className="combo_teamsNameB"></div>
				</div>

				<PausingVideo
					src={Karne_Clock}
					width={633}
					height={66}
					className="combo_penalties_cover"
					steps={[850]}
					step={penaltiesStep}
				/>
			</div>
		</div>
	);
}

function pickTextColorBasedOnBgColorAdvanced(
	bgColor: string,
	lightColor: string,
	darkColor: string
) {
	var color = bgColor.charAt(0) === "#" ? bgColor.substring(1, 7) : bgColor;
	var r = parseInt(color.substring(0, 2), 16); // hexToR
	var g = parseInt(color.substring(2, 4), 16); // hexToG
	var b = parseInt(color.substring(4, 6), 16); // hexToB
	var uicolors = [r / 255, g / 255, b / 255];
	var c = uicolors.map((col) => {
		if (col <= 0.03928) {
			return col / 12.92;
		}
		return Math.pow((col + 0.055) / 1.055, 2.4);
	});
	var L = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
	return L > 0.179 ? darkColor : lightColor;
}
