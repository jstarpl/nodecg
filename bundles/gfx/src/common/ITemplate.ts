export interface ITemplate<
  T extends TemplateValueType
> {
  id: string;
  onAir: boolean;
  values: T;
}

export type TemplateValueType = Record<string, string | string[] | string[][] | boolean>
