import { ITemplate } from "../ITemplate";
import {
  REPLICANT_NAME as COMBO_REPLICANT,
  DEFAULT_TEMPLATE as COMBO_DEFAULT,
} from "./IScoreBug";
import {
  REPLICANT_NAME as LOWER_THIRD_REPLICANT,
  DEFAULT_TEMPLATE as LOWER_THIRD_DEFAULT,
} from "./ILowerThird";

export const REPLICANT_DEFAULTS: Record<string, ITemplate<any>> = {
	[LOWER_THIRD_REPLICANT]: LOWER_THIRD_DEFAULT,
	[COMBO_REPLICANT]: COMBO_DEFAULT,
};

export const OFFSETABLE_TEMPLATES: Record<string, number> = {};
