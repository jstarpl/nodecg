import { NodeCG } from "../../../../../types/server";
import { getData as getPLKTabela } from "./plk.standings";
import { getData as getPLKKolejka } from "./plk.fixtures";
import { setTimeout, clearTimeout } from "timers";
import { NAMESPACE } from "../namespace";
import { WebScraperRow, WebScraperStatus } from "common/webScraper";
import { ListenForCb } from "../../../../../types/lib/nodecg-instance";

const MAX_RETRY_INTERVAL = 30000;
const BACK_OFF_BASE = 5000;

function getDataFromWebSite(
  mode: "plk.tabela" | "plk.kolejka",
  kolejka?: number
): Promise<object[]> {
  if (mode === "plk.tabela") {
    return getPLKTabela();
  } else if (mode === "plk.kolejka" && kolejka !== undefined) {
    return getPLKKolejka(String(kolejka));
  } else {
    nodecg.log.warn(`Unknown webScraper mode ${mode}`);
    return Promise.resolve([]);
  }
}

export function webScraper(nodecg: NodeCG) {
  const statusReplicant = nodecg.Replicant<WebScraperStatus>(
    "system:webScraperStatus",
    NAMESPACE,
    {
      defaultValue: WebScraperStatus.EMPTY_URL,
      persistent: false,
    }
  );
  const lastUpdateReplicant = nodecg.Replicant<null | number>(
    "system:webScraperLastUpdate",
    NAMESPACE,
    {
      defaultValue: null,
      persistent: false,
    }
  );

  function refreshNow(args: any, ack?: ListenForCb) {
    try {
      getDataFromWebSite(args.mode, args.kolejka)
        .then((data) => {
          statusReplicant.value = WebScraperStatus.OK;
          lastUpdateReplicant.value = Date.now();
          // schedule next refresh in regular time
          if (ack && !ack.handled) {
            ack(null, data);
          }
        })
        .catch((e) => {
          nodecg.log.error(`Web Scraper: `, e);
          statusReplicant.value = WebScraperStatus.CONSTANT_FAILURE;
          if (ack && !ack.handled) {
            ack(e);
          }
        });
    } catch (e) {
      if (e instanceof Error) {
        if (e.message === WebScraperStatus.EMPTY_URL) {
          statusReplicant.value = e.message;
        } else if (e.message === WebScraperStatus.INVALID_URL) {
          statusReplicant.value = e.message;
        } else {
          statusReplicant.value = WebScraperStatus.UNKNOWN_ERROR;
        }
      } else {
        statusReplicant.value = WebScraperStatus.UNKNOWN_ERROR;
      }

      if (ack && !ack.handled) {
        ack(e);
      }

      if (!(e instanceof Error) || e.message !== WebScraperStatus.EMPTY_URL) {
        nodecg.log.error(`Web Scraper: `, e);
      }
    }
  }

  nodecg.listenFor("system:webScraper:refreshNow", (arg, ack) => {
    refreshNow(arg, ack);
  });

  nodecg.log.info("Web Scraper: initialized");

  return {
    webScraperStatus: statusReplicant,
    lastUpdate: lastUpdateReplicant,
    refreshNow,
  };
}
