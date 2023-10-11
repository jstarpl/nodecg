import hyperid from "common/fastId";
import { ITemplate } from "common/ITemplate";

const getId = hyperid();

export interface ICommon
  extends ITemplate<{
   name1: string;
   shortName1: string;
   mediumName1: string;
   color1: string;
   name2: string;
   shortName2: string;
   mediumName2: string;
   color2: string;
  }> {}

export const TEMPLATE_NAME = "Wizytówka";

export const REPLICANT_NAME = "lowerThird";

export const DEFAULT_TEMPLATE: ICommon = {
  id: getId(),
  onAir: false,
  values: {
    name1: "",
    shortName1: "",
    mediumName1: "",
    color1: "",
    name2: "",
    shortName2: "",
    mediumName2: "",
    color2: ""
  }
};

export const REPLICANT_OPTIONS = {
  defaultValue: DEFAULT_TEMPLATE,
};

export const TEMPLATE_DURATION = 0;
