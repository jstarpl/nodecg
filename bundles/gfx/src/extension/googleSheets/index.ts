import { NodeCG } from "../../../../../types/server";
import { getData as getDataWithSheetson } from "./sheetson";
import { setTimeout, clearTimeout } from "timers";
import { NAMESPACE } from "../namespace";
import { GoogleSheetsRow, GoogleSheetsStatus } from "common/googleSheets";
import { ListenForCb } from "../../../../../types/lib/nodecg-instance";
import {
  getTeamData as getTeamDataFromGoogleSheets,
  getStatsData as getStatsDataFromGoogleSheets,
} from "./ebl";

const REFRESH_INTERVAL = 120000; // unfortunately this needs to be quite high
const BACK_OFF_BASE = 5000;

// function getDataFromSheets(
//   sheetId: string,
//   worksheetName: string
// ): Promise<object[]> {
//   return getDataWithSheetson(sheetId, worksheetName);
// }

function getTeamDataFromEuroBasketSheet(teamName: string): Promise<object[]> {
  return getTeamDataFromGoogleSheets(teamName);
}

function getStatsDataFromEuroBasketSheet(): Promise<object[]> {
  return getStatsDataFromGoogleSheets();
}

export function googleSheets(nodecg: NodeCG) {
  const statusReplicant = nodecg.Replicant<GoogleSheetsStatus>(
    "system:googleSheetsStatus",
    NAMESPACE,
    {
      defaultValue: GoogleSheetsStatus.EMPTY_URL,
      persistent: false,
    }
  );
  const dataReplicant = nodecg.Replicant("system:googleSheetsData", NAMESPACE, {
    defaultValue: [] as GoogleSheetsRow[],
  });
  const lastUpdateReplicant = nodecg.Replicant<null | number>(
    "system:googleSheetsLastUpdate",
    NAMESPACE,
    {
      defaultValue: null,
      persistent: false,
    }
  );

  nodecg.listenFor("system:googleSheets:refreshNow", (arg, ack) => {
    if (arg?.teamName) {
      const teamName = arg.teamName;
      getTeamDataFromEuroBasketSheet(teamName)
        .then((data) => {
          statusReplicant.value = GoogleSheetsStatus.OK;
          lastUpdateReplicant.value = Date.now();
          if (ack && !ack.handled) ack(null, data);
        })
        .catch((error) => {
          statusReplicant.value = GoogleSheetsStatus.CONSTANT_FAILURE;
          nodecg.log.error(error);
          if (ack && !ack.handled) ack(error);
        });
    } else if (arg?.stats) {
      getStatsDataFromEuroBasketSheet()
        .then((data) => {
          statusReplicant.value = GoogleSheetsStatus.OK;
          lastUpdateReplicant.value = Date.now();
          if (ack && !ack.handled) ack(null, data);
        })
        .catch((error) => {
          statusReplicant.value = GoogleSheetsStatus.CONSTANT_FAILURE;
          nodecg.log.error(error);
          if (ack && !ack.handled) ack(error);
        });
    }
  });

  // interval = setTimeout(refreshNow, REFRESH_INTERVAL);
  // refreshNow();

  nodecg.log.info("Google Spreadsheets: initialized");

  return {
    googleSheetsStatus: statusReplicant,
    lastUpdate: lastUpdateReplicant,
    data: dataReplicant,
  };
}
