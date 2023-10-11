import fetch from "node-fetch";

const API_TOKEN =
  "fm-w_L1Y62LxR_F3V91qAneucFPflgLmE2VUXk38dgbngJ5j-gUsJnSVtFgd8g";

type ISheetsonResult = {
  results: object[];
  hasNextPage: boolean;
};

type ISheetsonError = {
  code: number;
  message: string;
};

type ISheetsonReply = ISheetsonResult | ISheetsonError;

function isError(reply: ISheetsonReply): reply is ISheetsonError {
  if ((reply as any).code) {
    return true;
  }
  return false;
}

export async function getData(
  sheetId: string,
  worksheetName: string
): Promise<object[]> {
  const res = await fetch(
    `https://api.sheetson.com/v2/sheets/${encodeURIComponent(worksheetName)}`,
    {
      headers: {
        authorization: `Bearer ${API_TOKEN}`,
        "X-Spreadsheet-Id": sheetId,
      },
    }
  );
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as ISheetsonReply;
  if (isError(data))
    throw new Error(`Sheetson error: ${data.code} ${data.message}`);
  if (!Array.isArray(data?.results))
    throw new Error(`Results are not an array: ${JSON.stringify(data)}`);
  return data?.results;
}
