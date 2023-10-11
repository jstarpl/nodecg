import { NodeCG } from "../../../../../types/server";
import { ServerResponse, IncomingMessage } from "http";

const clbs: CodeCallback[] = [];

type CodeCallback = (code: string) => void;

export function onOAuthCode(clb: CodeCallback) {
  clbs.push(clb);
}

export function oauth(nodecg: NodeCG) {
  nodecg.mount("/oauth", (req: IncomingMessage, res: ServerResponse) => {
    nodecg.log.info(
      `GET http://${req.headers?.host ?? "localhost"} ${req.url}`
    );
    const url = new URL(
      req.url ?? "/",
      `http://${req.headers?.host ?? "localhost"}`
    );

    const code = url.searchParams.get("code");
    if (!code) {
      console.error(`No code in callback redirect. URL was: ${req.url}`);
      return;
    }

    clbs.forEach((clb) => clb(code));
    clbs.length = 0;

    res.end("Authorized");
  });
}
