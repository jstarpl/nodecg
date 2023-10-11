import type NodeCG from '@nodecg/types';
import { scoreboardOCR } from "./scoreboardocr";
import { httpApi } from "./httpApi";
import { clock as internalClock } from "./clock";
import { NAMESPACE } from "./namespace";
import { obs } from "./obs";
import { oauth } from "./oauth";
//  import { statscore } from "./statscore";
import { playlist } from "./playlist";

const DEFAULT_PENALTIES = "-----";

export = (nodecg: NodeCG.ServerAPI) => {
	const menOrWomen = nodecg.Replicant("menOrWomen", NAMESPACE, {
		defaultValue: "men",
		persistent: false,
	});
	menOrWomen.value = process.env.GENDER === "women" ? "women" : "men";

	const clock = nodecg.Replicant("clock", NAMESPACE, { defaultValue: "" });
	const score1 = nodecg.Replicant("score1", NAMESPACE, { defaultValue: "" });
	const score2 = nodecg.Replicant("score2", NAMESPACE, { defaultValue: "" });

	const penalties1 = nodecg.Replicant("penalties1", NAMESPACE, {
		defaultValue: DEFAULT_PENALTIES,
	});
	const penalties2 = nodecg.Replicant("penalties2", NAMESPACE, {
		defaultValue: DEFAULT_PENALTIES,
	});

	const timeout11 = nodecg.Replicant("timeout11", NAMESPACE, {
		defaultValue: "",
	});
	const timeout12 = nodecg.Replicant("timeout12", NAMESPACE, {
		defaultValue: "",
	});
	const timeout13 = nodecg.Replicant("timeout13", NAMESPACE, {
		defaultValue: "",
	});
	const timeout21 = nodecg.Replicant("timeout21", NAMESPACE, {
		defaultValue: "",
	});
	const timeout22 = nodecg.Replicant("timeout22", NAMESPACE, {
		defaultValue: "",
	});
	const timeout23 = nodecg.Replicant("timeout23", NAMESPACE, {
		defaultValue: "",
	});

	nodecg.listenFor("superliga:clearTimeouts", () => {
		timeout11.value = "";
		timeout12.value = "";
		timeout13.value = "";
		timeout21.value = "";
		timeout22.value = "";
		timeout23.value = "";
		penalties1.value = DEFAULT_PENALTIES;
		penalties2.value = DEFAULT_PENALTIES;
	});

	const {
		start: startClock,
		stop: stopClock,
		reset: resetClock,
		clockDirection: internalClockDirection,
		clockResetValue: internalClockResetValue,
		clockShowHours: internalClockShowHours,
	} = internalClock(nodecg, clock);

	const globalReplicants = {
		clock,
		score1,
		score2,
		timeout11,
		timeout12,
		timeout13,
		timeout21,
		timeout22,
		timeout23,
		penalties1,
		penalties2,
		_internalClockDirection: internalClockDirection,
		_internalClockResetValue: internalClockResetValue,
		_internalClockShowHours: internalClockShowHours,
	};

	nodecg.Replicant("system:globalReplicants", NAMESPACE, {
		defaultValue: Object.keys(globalReplicants),
		persistent: false,
	});

	const actions = {
		startClock,
		stopClock,
		resetClock,
	};

	scoreboardOCR(nodecg, globalReplicants, {
		scoreA: "score1",
		scoreB: "score2",
		"timeout1-1": "timeout11",
		"timeout1-2": "timeout12",
		"timeout1-3": "timeout13",
		"timeout2-1": "timeout21",
		"timeout2-2": "timeout22",
		"timeout2-3": "timeout23",
	});

	obs(nodecg);

	httpApi(nodecg, actions, globalReplicants);

	// dataApi(nodecg);

	playlist(nodecg);

	// statscore(nodecg);

	oauth(nodecg);
};;
