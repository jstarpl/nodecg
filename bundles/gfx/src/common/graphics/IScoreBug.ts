import hyperid from "common/fastId";
import { ITemplate } from "common/ITemplate";

const getId = hyperid();

export interface IScoreBug
	extends ITemplate<{
		hideClock: boolean;
		showPenalties: boolean;
	}> {}

export const TEMPLATE_NAME = "Combo";

export const REPLICANT_NAME = "combo";

export const DEFAULT_TEMPLATE: IScoreBug = {
	id: getId(),
	onAir: false,
	values: {
		hideClock: true,
		showPenalties: false,
	},
};

export const REPLICANT_OPTIONS = {
  defaultValue: DEFAULT_TEMPLATE,
};

export const TEMPLATE_DURATION = 1000;
