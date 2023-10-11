import type { NodeCG } from "../../../../types/server";
import fetch from "node-fetch-commonjs";
import { NAMESPACE } from "./namespace";
import { StatscoreClient } from "./statscore/statscoreClient";
import config from "./statscore.config";
import { StatscoreMethods, StatscoreReplicants } from "common/statscore";
import {
	REPLICANT_NAME as COMMON_REPLICANT,
	REPLICANT_OPTIONS as COMMON_OPTIONS,
} from "common/graphics/ICommon";
import {
	REPLICANT_NAME as REFS_REPLICANT,
	REPLICANT_OPTIONS as REFS_OPTIONS,
} from "common/graphics/IReferees";
import {
	REPLICANT_NAME as STATS_REPLICANT,
	REPLICANT_OPTIONS as STATS_OPTIONS,
} from "common/graphics/IStats";
import {
	REPLICANT_NAME as TEAM_REPLICANT,
	REPLICANT_OPTIONS as TEAM_OPTIONS,
} from "common/graphics/ITeamList";
import {
	REPLICANT_NAME as FIXTURES_REPLICANT,
	REPLICANT_OPTIONS as FIXTURES_OPTIONS,
} from "common/graphics/IFixtures";
import {
	REPLICANT_NAME as STANDINGS_REPLICANT,
	REPLICANT_OPTIONS as STANDINGS_OPTIONS,
} from "common/graphics/IStandings";

export function statscore(nodecg: NodeCG) {
	const sScore = new StatscoreClient(
		config.statscore.apiUrl,
		config.statscore.clientId,
		config.statscore.secretKey
	);
	sScore.defaultQueryArguments = {
		lang: "pl",
		tz: "Europe/Warsaw",
	};

	const allMatches = nodecg.Replicant(
		StatscoreReplicants.AllMatches,
		NAMESPACE,
		{
			defaultValue: [] as any[],
			persistent: false,
		}
	);
	const selectedMatch = nodecg.Replicant(
		StatscoreReplicants.SelectedMatch,
		NAMESPACE,
		{
			defaultValue: "",
		}
	);

	let currentMatch: any = {};

	function updateMatches() {
		(async () => {
			const allStagesArray: any[] = [];
			try {
				let page = 1;
				let hasMore = false;
				do {
					const data = await sScore.eventsList({
						season_id: String(config.statscore.seasonId),
						page: String(page),
					});
					const stages = data.api.data.competitions[0].seasons[0].stages.map(
						(stage: any) => ({
							id: stage.id,
							name: stage.name,
							isCurrent: stage.is_current,
							matches: stage.groups[0].events.map((event: any) => ({
								id: event.id,
								name: `${event.round_id}: ${event.name}`,
								startDate: event.start_date,
								round: event.round_id,
								status: event.status_type,
								participants: event.participants.map((participant: any) => ({
									id: participant.id,
									name: participant.name,
									shortName: participant.acronym,
									score: (
										participant.stats.find((stat: any) => stat.id === 40) || {
											value: null,
										}
									).value,
								})),
							})),
						})
					);

					stages.forEach((stage: any) => {
						const existingStage = allStagesArray.find((e) => e.id === stage.id);
						if (existingStage) {
							existingStage.matches = existingStage.matches.concat(
								stage.matches
							);
						} else {
							allStagesArray.push(stage);
						}
					});

					hasMore = !!data.api.method.next_page;
					page++;
				} while (hasMore);

				allMatches.value = allStagesArray;
			} catch (e) {
				nodecg.log.error(e);
			}
		})();
	}
	setInterval(updateMatches, 5 * 60 * 1000 + 60000 * Math.random());
	setTimeout(() => {
		updateMatches();
	}, 15000 * Math.random());

	const common = nodecg.Replicant(COMMON_REPLICANT, NAMESPACE, COMMON_OPTIONS);
	const refs = nodecg.Replicant(REFS_REPLICANT, NAMESPACE, REFS_OPTIONS);

	async function updateMatchInner(eventObj: any) {
		const participants = await Promise.all(
			eventObj.participants.map(async (participant: any) => ({
				id: participant.id,
				name: participant.name,
				mediumName: participant.short_name,
				shortName: participant.acronym,
				stats: participant.stats,
				lineup: await Promise.all(
					participant.lineups.map(async (player: any) => {
						const detailObj = await sScore.participantsShow(
							player.participant_id,
							undefined,
							true
						);
						const positions = [
							player.shirt_nr || null !== null
								? detailObj.api.data.participant.details.position_name ||
								  undefined
								: undefined,
							player.type === "coach" ? "Trener" : undefined,
						].filter((position) => position !== undefined);

						return {
							id: player.participant_id,
							shirtNr: parseInt(player.shirt_nr) || null,
							coach: player.type === "coach",
							name: detailObj.api.data.participant.name,
							position: positions.join(", "),
						};
					})
				),
			}))
		);
		const currentMatchObj = {
			id: eventObj.id,
			name: eventObj.name,
			status: eventObj.status_type,
			round: eventObj.round_id,
			referees: eventObj.referees.map((refObj: any) => ({
				id: refObj.referee.id,
				name: refObj.referee.short_name,
				type: refObj.referee.referee_type,
			})),
			participants,
		};
		currentMatch = currentMatchObj;

		common.value = {
			...common.value,
			values: {
				...common.value.values,
				stage: `${currentMatch.round}. SERIA`,
				team1: currentMatch.participants[0].name,
				shortTeam1: currentMatch.participants[0].shortName,
				mediumTeam1: currentMatch.participants[0].mediumName,
				team2: currentMatch.participants[1].name,
				shortTeam2: currentMatch.participants[1].shortName,
				mediumTeam2: currentMatch.participants[1].mediumName,
			},
		};
		const currentName1 = refs.value.values.name1;
		const currentName2 = refs.value.values.name2;
		refs.value = {
			...refs.value,
			values: {
				name1:
					currentName1 === ""
						? currentMatchObj.referees?.[0]?.name ?? ""
						: currentName1,
				name2:
					currentName2 === ""
						? currentMatchObj.referees?.[1]?.name ?? ""
						: currentName2,
			},
		};
	}

	function updateMatch() {
		(async () => {
			const matchId = parseInt(selectedMatch.value);
			if (matchId >= 0) {
				try {
					const data = await sScore.eventsShow(matchId);
					const eventObj = data.api.data.competition.season.stage.group.event;
					await updateMatchInner(eventObj);
				} catch (e) {
					nodecg.log.error(e);
				}
			}
		})().catch(console.error);
	}

	selectedMatch.on("change", (o, n) => {
		updateMatch();
	});
	setInterval(updateMatch, 90 * 1000 + 10000 * Math.random());
	setTimeout(() => {
		updateMatch();
	}, 10000 * Math.random());

	const stats = nodecg.Replicant(STATS_REPLICANT, NAMESPACE, STATS_OPTIONS);

	function updateStats() {
		const matchObj = currentMatch;

		stats.value = {
			...stats.value,
			values: {
				...stats.value.values,
				data: EXPECTED_STATS.map((value) => {
					const id = parseInt(value[0]);
					const label = value[1];
					const suffix = value[2] || "";
					const val1 = Math.round(
						(
							matchObj.participants[0].stats.find(
								(stat: any) => stat.id === id
							) || { value: "" }
						).value
					);
					const val2 = Math.round(
						(
							matchObj.participants[1].stats.find(
								(stat: any) => stat.id === id
							) || { value: "" }
						).value
					);
					return `${val1}${suffix},${label},${val2}${suffix}`;
				}).join("\n"),
			},
		};
	}

	nodecg.listenFor(StatscoreMethods.UpdateStats, NAMESPACE, () => {
		updateStats();
	});

	const teams = nodecg.Replicant(TEAM_REPLICANT, NAMESPACE, TEAM_OPTIONS);

	function updatePlayers() {
		const matchObj = currentMatch;

		let team1Roster = "";
		let team1Coach1 = "";
		let team1Coach2 = "";

		try {
			const lineup = matchObj.participants[0].lineup.filter(
				(player: any) => !player.coach
			);
			team1Roster = lineup
				.map(
					(player: any) => `${player.shirtNr},${player.name},${player.position}`
				)
				.join("\n");
			const coach = matchObj.participants[0].lineup.filter(
				(player: any) => player.coach === true
			);
			team1Coach1 = (coach[0] && coach[0].name) || "";
			team1Coach2 = (coach[1] && coach[1].name) || "";
		} catch (e) {
			nodecg.log.error(e);
		}

		let team2Roster = "";
		let team2Coach1 = "";
		let team2Coach2 = "";

		try {
			const lineup = matchObj.participants[1].lineup.filter(
				(player: any) => !player.coach
			);
			team2Roster = lineup
				.map(
					(player: any) => `${player.shirtNr},${player.name},${player.position}`
				)
				.join("\n");
			const coach = matchObj.participants[1].lineup.filter(
				(player: any) => player.coach === true
			);
			team2Coach1 = (coach[0] && coach[0].name) || "";
			team2Coach2 = (coach[1] && coach[1].name) || "";
		} catch (e) {
			nodecg.log.error(e);
		}

		teams.value = {
			...teams.value,
			values: {
				...teams.value.values,
				players1: team1Roster,
				coach1a: team1Coach1,
				coach1b: team1Coach2,
				players2: team2Roster,
				coach2a: team2Coach1,
				coach2b: team2Coach2,
			},
		};
	}

	nodecg.listenFor(StatscoreMethods.UpdatePlayers, NAMESPACE, () => {
		updatePlayers();
	});

	const fixtures = nodecg.Replicant(
		FIXTURES_REPLICANT,
		NAMESPACE,
		FIXTURES_OPTIONS
	);

	function updateFixtures(round: number) {
		const allMatchesObj = allMatches.value;
		const currentStage = allMatchesObj.find((stage) => stage.isCurrent);
		const matchesInRound = currentStage.matches.filter(
			(match: any) => match.round === round
		);
		const fixtureObjs = matchesInRound.map((m: any) => ({
			t1ShortName: m.participants[0].shortName,
			t1Name: m.participants[0].name,
			t1Score: m.participants[0].score,
			t2ShortName: m.participants[1].shortName,
			t2Name: m.participants[1].name,
			t2Score: m.participants[1].score,
			isFinished: m.status === "finished",
			date: m.startDate,
		}));
		fixtures.value = {
			...fixtures.value,
			values: {
				...fixtures.value.values,
				title: `${round}. SERIA`,
				title2: `Terminarz Spotkań`,
				contents: JSON.stringify(fixtureObjs),
			},
		};
	}

	nodecg.listenFor(StatscoreMethods.UpdateFixtures, NAMESPACE, (round) => {
		updateFixtures(parseInt(round));
	});

	const table = nodecg.Replicant(
		STANDINGS_REPLICANT,
		NAMESPACE,
		STANDINGS_OPTIONS
	);

	function updateTable() {
		(async () => {
			const response = await fetch(config.tableUrl);
			const json = (await response.json()) as any;

			const result = json.data.map((a: any) => ({
				id: a.id,
				miejsce: a.miejsce,
				shortName: a.nazwa_skrot,
				name: a.nazwa,
				m: a.mecze,
				z: a.zwyciestwa || 0,
				zpk: a.zwyciestwa_karne || 0,
				p: a.przegrane || 0,
				ppk: a.przegrane_karne || 0,
				pkt: a.punkty || 0,
				bramki: a.bramki_zdobyte + ":" + a.bramki_stracone,
			}));
			table.value = {
				...table.value,
				values: {
					...table.value.values,
					title: `${currentMatch?.round}. SERIA`,
					contents: JSON.stringify(result),
				},
			};
		})().catch(console.error);
	}

	nodecg.listenFor(StatscoreMethods.UpdateTable, NAMESPACE, () => {
		updateTable();
	});

	nodecg.log.info("Statscore: initialized");
}

const EXPECTED_STATS = [
	["638", "Skuteczność w ataku", "%"],
	["20", "Rzuty celne"],
	["21", "Rzuty niecelne"],
	["72", "Straty"],
	["695", "Skuteczność w obronie", "%"],
	["29", "Rzuty obronione"],
	["835", "Bramki z kontrataku"],
	["481", "Rzuty karne"],
	["22", "Faule"],
	["122", "Kary"],
];
