import React, { useEffect, useState } from "react";
import {
	ILowerThird,
	REPLICANT_NAME,
	REPLICANT_OPTIONS,
} from "common/graphics/ILowerThird";
import { useOnlyReplicantValue } from "common/useReplicant";
import "./LowerThird.css";
import { ThinText } from "../components/ThinText";
import LowerThirdBkg from "./BELKI_WSZYSTKIE_F787.avi.webm";
import WLowerThirdBkg from "./W.BELKI_WSZYSTKIE.avi.webm";
import { PausingVideo } from "../components/PausingVideo";
import { FitText } from "../components/FitText";
import { useType } from "../lib/lib";

export function LowerThird() {
	const template = useOnlyReplicantValue<ILowerThird>(
		REPLICANT_NAME,
		undefined,
		REPLICANT_OPTIONS
	);

	const onOff = template?.onAir ? "on" : "off";

	const [bkgStep, setBkgStep] = useState(-1);

	const type = useType();

	useEffect(() => {
		if (onOff === "on") {
			setBkgStep(0);
		} else {
			setBkgStep(1);
		}
	}, [onOff]);

	const hasPlayerNumber = (template.values.playerNumber ?? "").trim() !== "";

	return (
		<div id="LowerThird" className={`${onOff}`}>
			<div className="LowerThird__container">
				<div className="LowerThird_top">
					<FitText width={800} align="left">
						{template.values.line1}
					</FitText>
				</div>
				<div className="LowerThird_bottom">
					<FitText width={650} align="right">
						{template.values.line2}
					</FitText>
				</div>
			</div>

			{type === "men" ? (
				<PausingVideo
					className="background"
					src={LowerThirdBkg}
					width={1002}
					height={196}
					muted
					steps={[787]}
					step={bkgStep}
				/>
			) : (
				<PausingVideo
					className="background"
					src={WLowerThirdBkg}
					width={1002}
					height={196}
					muted
					steps={[787]}
					step={bkgStep}
				/>
			)}
		</div>
	);
}
