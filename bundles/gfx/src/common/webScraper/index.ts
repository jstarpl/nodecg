export enum WebScraperStatus {
  EMPTY_URL = "emptyUrl",
  INVALID_URL = "invalidUrlError",
  CONSTANT_FAILURE = "contantFailError",
  UNKNOWN_ERROR = "error",
  OK = "ok",
}

export type WebScraperRow = {
  [key: string]: string;
} & {
  rowIndex: number;
};
