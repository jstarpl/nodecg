import * as net from "net";
import * as dgram from "dgram";
import jsonParseMulti from "json-multi-parse";
import { NodeCG, Replicant } from "../../../../types/server";

type ScoreboardOCRMessage =
  | {
      type: "ocr";
      values: Record<string, string>;
    }
  | {
      type: "register";
      role: "ocr";
      stream: string;
    };

export function scoreboardOCR<
  T extends Record<string, Replicant<string | number | boolean>>
>(nodecg: NodeCG, replicants: T, aliases?: Record<string, keyof T>) {
  const status = nodecg.Replicant("scoreboardOCR:status", {
    defaultValue: 0,
    persistent: false,
  });
  const uplinkDelay = nodecg.Replicant("scoreboardOCR:uplinkDelay", {
    defaultValue: 0,
    persistent: true,
  });

  function handleMessages(
    data: string,
    streamName?: string,
    setStreamName?: (streamName: string) => void
  ) {
    try {
      const msgs = jsonParseMulti(data.toString()) as ScoreboardOCRMessage[];
      for (const msg of msgs) {
        // {“type”:”ocr”, “values”:{"field_name1": “value1”, "field_name2": “value2”}}
        if (msg.type === "ocr" && msg.values) {
          setTimeout(() => {
            try {
              const values = Object.entries(msg.values);
              for (const value of values) {
                const [fieldName, fieldValue] = value;
                let replicant = replicants[fieldName];
                if (!replicant) {
                  const aliasedFieldName = aliases && aliases[fieldName];
                  if (aliasedFieldName) {
                    replicant = replicants[aliasedFieldName];
                  }
                }
                if (!replicant) {
                  // nodecg.log.warn(
                  //   `ScoreboardOCR: unknown field name: "${fieldName}"`
                  // );
                  continue;
                }

                replicant.value = String(fieldValue).trim();
              }
            } catch (e) {
              nodecg.log.error(
                `ScoreboardOCR: error when setting replicant values: ${e}`
              );
            }
          }, (uplinkDelay?.value ?? 0) * 1000);

          // {"type":"register", "stream":"zegar", "role":"ocr"}
        } else if (msg.type === "register" && msg.role === "ocr") {
          nodecg.log.info(
            `ScoreboardOCR: new Scoreboard OCR stream registered: /${msg.stream}`
          );
          setStreamName && setStreamName(msg.stream);
        } else {
          nodecg.log.warn(
            `ScoreboardOCR: unknown message type from "${
              streamName ?? "(UNKNOWN)"
            }": ${msg.type}: ${JSON.stringify(msg)}`
          );
        }
      }
    } catch (e) {
      nodecg.log.error(
        `ScoreboardOCR: unable to parse clock message from "${
          streamName ?? "(UNKNOWN)"
        }": ${e}, ${data}"`
      );
    }
  }

  const scoreOCRPort = nodecg.config.port + 100;
  const scoreOCRServer = net.createServer((socket) => {
    // 'connection' listener
    let streamName: string | null = null;
    nodecg.log.info(
      `ScoreboardOCR: client connected ${socket.remoteAddress}:${socket.remotePort}`
    );
    if (status) status.value = status.value + 1;
    socket.on("error", (err) => {
      nodecg.log.error(
        `ScoreboardOCR: error when reading from socket "${
          streamName ?? "(UNKNOWN)"
        }": ${err}`
      );
    });
    socket.on("data", (data) => {
      handleMessages(data.toString("utf8"), streamName ?? undefined);
    });
    socket.on("end", () => {
      nodecg.log.info(
        `ScoreboardOCR: clock client disconnected: ${socket.remoteAddress}:${socket.remotePort}`
      );
      if (status) status.value = Math.max(0, status.value - 1);
    });
  });
  scoreOCRServer.on("error", (err) => {
    nodecg.log.error(`ScoreboardOCR: clock server error: ${err}`);
  });
  scoreOCRServer.listen(scoreOCRPort, () => {
    nodecg.log.info(
      `ScoreboardOCR: clock server listening on TCP port: ${scoreOCRPort}`
    );
  });

  const scoreOCRDgramSocket = dgram.createSocket("udp4", (msg, rinfo) => {
    handleMessages(msg.toString("utf8"), rinfo.address);
  });
  scoreOCRDgramSocket.bind(scoreOCRPort, undefined, () => {
    nodecg.log.info(
      `ScoreboardOCR: clock server listening on UDP port: ${scoreOCRPort}`
    );
  });

  return {
    status,
    uplinkDelay,
  };
}
