import hyperid from "common/fastId";
import { ITemplate } from "common/ITemplate";

const getId = hyperid();

export interface ILowerThird
  extends ITemplate<{
    line1: string;
    playerNumber: string;
    line2: string;
    showStats: boolean;
  }> {}

export const TEMPLATE_NAME = "Wizytówka";

export const REPLICANT_NAME = "lowerThird";

export const DEFAULT_TEMPLATE: ILowerThird = {
  id: getId(),
  onAir: false,
  values: {
    line1: "",
    playerNumber: "",
    line2: "",
    showStats: false,
  },
};

export const REPLICANT_OPTIONS = {
  defaultValue: DEFAULT_TEMPLATE,
};

export const TEMPLATE_DURATION = 700;
