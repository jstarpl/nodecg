import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { useOnlyReplicantValue } from "common/useReplicant";
import { LowerThird } from "./LowerThird/LowerThird";
import { Title } from "./Title/Title";
import { Combo } from "./Combo/Combo";
import { Break } from "./Break/Break";
import { TeamList } from "./TeamList/TeamList";
import { Referees } from "./Referees/Referees";
import { Fixtures } from "./Fixtures/Fixtures";
import { Standings } from "./Standings/Standings";
import { Stats } from "./Stats/Stats";
import { StatsByQuarter } from "./Stats/StatsByQuarter";
import { ScoreBug } from "./ScoreBug/ScoreBug";
import { PlayerDouble } from "./PlayerDouble/PlayerDouble";
import { Bracket } from "./Bracket/Bracket";
import { OnePlayerStatsQ } from "./LowerThirdPlayer/onePlayerStatsQ";

import "./index.css";
import { LowerThirdPlayer } from "./LowerThirdPlayer/LowerThirdPlayer";

function Graphics() {
	// const name = useOnlyReplicantValue("name", undefined, { defaultValue: "" });

	useEffect(() => {
		if (window.location.hash === "#debug") {
			document.body.classList.add("debug");
		}
	}, []);

	return (
		<>
			<Combo />
			<Title />
			<Break />
			<LowerThird />
			<TeamList />
			<Referees />
			<Fixtures />
			<Standings />
			<Stats />
		</>
	);
}

ReactDOM.render(<Graphics />, document.getElementById("root"));
