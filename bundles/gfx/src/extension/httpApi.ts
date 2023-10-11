import { REPLICANT_DEFAULTS } from "common/graphics/defaults";
import { ITemplate } from "common/ITemplate";
import { Response, Request } from "express";
import { NodeCG, Replicant } from "../../../../types/server";
import { NAMESPACE } from "./namespace";

type IActions = Record<string, () => void>;
type IGlobalReplicants = Record<string, Replicant<string | number | boolean>>;

export function httpApi(
  nodecg: NodeCG,
  actions?: IActions,
  globalReplicants?: IGlobalReplicants
) {
  const router = nodecg.Router();

  function playStopTemplate(
    req: Request,
    res: Response,
    templateId: string,
    state: boolean
  ) {
    if (!templateId) {
      res.status(400).end();
      return;
    }

    const templateDefault = REPLICANT_DEFAULTS[templateId];
    if (!templateDefault) {
      res.status(404).end();
      return;
    }

    nodecg.log.info(
      `HTTP API: ${req.socket.remoteAddress} ${
        state ? "PLAY" : "STOP"
      } ${templateId}`
    );
    const replicant = nodecg.Replicant(templateId, NAMESPACE, {
      defaultValue: templateDefault,
    });

    if (!replicant.value || !replicant.value.values) {
      res.status(500).end();
      return;
    }

    replicant.value = {
      ...replicant.value,
      onAir: state,
    };
    res.status(200).end();
  }

  router.get("/globals", (req, res) => {
    if (!globalReplicants) {
      res.status(501).end();
      return;
    }

    nodecg.log.info(`HTTP API: ${req.socket.remoteAddress} GET /globals`);

    const report: Record<string, string | number | boolean> = {};
    for (const [key, value] of Object.entries(globalReplicants)) {
      report[key] = value.value;
    }
    res.status(200).json(report).end();
  });

  router.post("/update/globals", (req, res) => {
    if (!globalReplicants) {
      res.status(501).end();
      return;
    }

    if (typeof req.body !== "object") {
      res.status(400).end();
      return;
    }

    const patch: Record<string, string | number> = req.body;

    nodecg.log.info(`HTTP API: ${req.socket.remoteAddress} UPDATE globals`);

    for (const [key, value] of Object.entries(patch)) {
      if (!globalReplicants[key]) continue;
      if (typeof value === "number") {
        const curValue = String(globalReplicants[key].value);
        if (Number.parseFloat(curValue).toString() === String(curValue)) {
          globalReplicants[key].value = (
            Number.parseFloat(curValue) + value
          ).toString();
        }
      } else {
        globalReplicants[key].value = value as any;
      }
    }
    res.status(200).end();
  });

  router.get("/actions", (req, res) => {
    if (!actions) {
      res.status(501).end();
      return;
    }

    nodecg.log.info(`HTTP API: ${req.socket.remoteAddress} GET /actions`);

    res.status(200).json(Object.keys(actions)).end();
    return;
  });

  router.post("/actions/:actionName", (req, res) => {
    const actionName = req.params["actionName"];

    const action = actions && actions[actionName];
    if (!action) {
      res.status(404).end();
      return;
    }

    nodecg.log.info(
      `HTTP API: ${req.socket.remoteAddress} ACTION ${actionName}`
    );

    try {
      action();
      res.status(200).end();
      return;
    } catch (e) {
      nodecg.log.error(
        `HTTP API: Error executing action "${actionName}": ${e}`
      );
      res.status(500).end();
      return;
    }
  });

  router.post("/play/:templateId", (req, res) => {
    const templateId = req.params["templateId"];
    playStopTemplate(req, res, templateId, true);
  });

  router.post("/stop/:templateId", (req, res) => {
    const templateId = req.params["templateId"];
    playStopTemplate(req, res, templateId, false);
  });

  router.post("/update/:templateId", (req, res) => {
    const templateId = req.params["templateId"];
    if (!templateId) {
      res.status(400).end();
      return;
    }

    const templateDefault = REPLICANT_DEFAULTS[templateId];
    if (!templateDefault) {
      res.status(404).end();
      return;
    }

    if (typeof req.body !== "object") {
      res.status(400).end();
      return;
    }

    const patch = req.body;

    nodecg.log.info(
      `HTTP API: ${
        req.socket.remoteAddress
      } UPDATE ${templateId} ${JSON.stringify(patch)}`
    );
    const replicant = nodecg.Replicant(templateId, NAMESPACE, {
      defaultValue: templateDefault,
    });

    if (!replicant.value || !replicant.value.values) {
      res.status(500).end();
      return;
    }

    const newValues = {
      ...replicant.value.values,
    };

    for (const [key, value] of Object.entries(patch)) {
      if (typeof value === "number") {
        if (
          Number.parseFloat(newValues[key]).toString() ===
          String(newValues[key])
        ) {
          newValues[key] = (
            Number.parseFloat(newValues[key]) + value
          ).toString();
        }
      } else {
        newValues[key] = value as any;
      }
    }

    replicant.value = {
      ...replicant.value,
      values: {
        ...newValues,
      },
    };
    res.status(200).end();
  });

  router.get("/:templateId", (req, res) => {
    const templateId = req.params["templateId"];
    if (!templateId) {
      res.status(400).end();
      return;
    }

    const templateDefault = REPLICANT_DEFAULTS[templateId];
    if (!templateDefault) {
      res.status(404).end();
      return;
    }

    if (typeof req.body !== "object") {
      res.status(400).end();
      return;
    }

    nodecg.log.info(`HTTP API: ${req.socket.remoteAddress} GET ${templateId}`);
    const replicant = nodecg.Replicant(templateId, NAMESPACE, {
      defaultValue: templateDefault,
    });

    if (!replicant.value || !replicant.value.values) {
      res.status(500).end();
      return;
    }

    res.status(200).json(replicant.value).end();
  });

  router.get("/", (req, res) => {
    nodecg.log.info(`HTTP API: ${req.socket.remoteAddress} GET /`);
    const status: Record<string, boolean> = {};
    for (const templateName of Object.keys(REPLICANT_DEFAULTS)) {
      const state = nodecg.readReplicant(templateName, NAMESPACE) as
        | ITemplate<any>
        | undefined;
      status[templateName] = state?.onAir ?? false;
    }

    res.status(200).json(status).end();
  });

  nodecg.mount("/api", router);
  nodecg.log.info("HTTP API: initialized");
}
