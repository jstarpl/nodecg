import { NodeCG } from "../../../../types/server";
import { NAMESPACE } from "./namespace";

export function dataApi(nodecg: NodeCG) {
  const router = nodecg.Router();

  const stats = nodecg.Replicant<Record<string, any>>("data:stats", NAMESPACE, {
    defaultValue: {},
    persistent: false,
  });

  const teams = nodecg.Replicant<Record<string, any>>("data:teams", NAMESPACE, {
    defaultValue: {},
    persistent: false,
  });

  const players = nodecg.Replicant<Record<string, Record<string, any>>>(
    "data:players",
    NAMESPACE,
    {
      defaultValue: {},
      persistent: false,
    }
  );

  router.post("/resetAll", (req, res) => {
    stats.value = {};
    teams.value = {};
    players.value = {};

    res.status(200).end();
  });

  router.post("/stats/:id", (req, res) => {
    const id = req.params["id"] as string;
    if (!stats.value?.[id]) {
      stats.value[id] = {};
    }
    stats.value[id] = req.body;

    res.status(200).end();
  });

  router.post("/stats/:id/:period", (req, res) => {
    const id = req.params["id"] as string;
    let period = req.params["period"] as string;
    if (period === "average") period = "9999";
    if (!stats.value?.[`${id}-${period}`]) {
      stats.value[`${id}-${period}`] = {};
    }
    stats.value[`${id}-${period}`] = req.body;

    res.status(200).end();
  });

  router.get("/stats/:id", (req, res) => {
    const id = req.params["id"] as string;

    res.json(stats.value?.[id] ?? {}).end();
  });

  router.get("/stats/:id/:period", (req, res) => {
    const id = req.params["id"] as string;
    let period = req.params["period"] as string;
    if (period === "average") period = "9999";

    res.json(stats.value?.[`${id}-${period}`] ?? {}).end();
  });

  router.post("/rosters/:id", (req, res) => {
    const id = req.params["id"] as string;
    teams.value[id] = req.body;
    players.value[id] = {};

    res.status(200).end();
  });

  router.get("/rosters/:id", (req, res) => {
    const id = req.params["id"] as string;

    res.json(teams.value?.[id] ?? {}).end();
  });

  router.post("/players/:teamId/:num", (req, res) => {
    const id = req.params["teamId"] as string;
    const num = req.params["num"] as string;
    if (!players.value?.[id]) {
      players.value[id] = {};
    }

    players.value[id][num] = req.body;

    res.status(200).end();
  });

  router.get("/players/:teamId/:num", (req, res) => {
    const id = req.params["teamId"] as string;
    const num = req.params["num"] as string;

    res.json(players.value?.[id]?.[num] ?? {}).end();
  });

  router.post("/players/:teamId/:num/:period", (req, res) => {
    const id = req.params["teamId"] as string;
    const num = req.params["num"] as string;
    let period = req.params["period"] as string;
    if (period === "average") period = "9999";

    if (!players.value?.[id]) {
      players.value[id] = {};
    }

    players.value[id][`${num}-${period}`] = req.body;

    res.status(200).end();
  });

  router.get("/players/:teamId/:num/:period", (req, res) => {
    const id = req.params["teamId"] as string;
    const num = req.params["num"] as string;
    let period = req.params["period"] as string;
    if (period === "average") period = "9999";

    res.json(players.value?.[id]?.[`${num}-${period}`] ?? {}).end();
  });

  nodecg.mount("/data", router);
  nodecg.log.info("Data API: initialized");
}
