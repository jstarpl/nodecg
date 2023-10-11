export enum GoogleSheetsStatus {
  EMPTY_URL = "emptyUrl",
  INVALID_URL = "invalidUrlError",
  INVALID_PERMISSIONS = "invalidPermissionsError",
  CONSTANT_FAILURE = "contantFailError",
  UNKNOWN_ERROR = "error",
  OK = "ok",
}

export type GoogleSheetsRow = {
  [key: string]: string;
} & {
  rowIndex: number;
};
