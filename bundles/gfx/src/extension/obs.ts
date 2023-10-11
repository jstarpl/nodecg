import { NodeCG, Replicant } from "../../../../types/server";
import { NAMESPACE } from "./namespace";
import OBSWebSocket, { EventSubscription } from "obs-websocket-js";
import minimist from "minimist";

const RECONNECT_INTERVAL = 10000;

async function connectToOBSUrl(
  nodecg: NodeCG,
  obs: OBSWebSocket,
  url: string,
  password: string | undefined
) {
  try {
    nodecg.log.info(`OBS: Trying to connect to: ${url}...`);
    const { obsWebSocketVersion, negotiatedRpcVersion } = await obs.connect(
      url,
      password,
      {
        eventSubscriptions: EventSubscription.All,
      }
    );
    nodecg.log.info(
      `OBS: Connected to server ${obsWebSocketVersion} (using RPC ${negotiatedRpcVersion})`
    );
  } catch (error: any) {
    nodecg.log.error(`OBS: Failed to connect: ${error.code} ${error.message}`);
    throw error;
  }
}

export function obs(nodecg: NodeCG) {
  const obsScenes = nodecg.Replicant("obs:scenes", NAMESPACE, {
    defaultValue: [] as string[],
    persistent: false,
  });

  const obsCurrentScene = nodecg.Replicant("obs:currentScene", NAMESPACE, {
    defaultValue: "",
    persistent: false,
  });

  const obsConnected = nodecg.Replicant("obs:connected", NAMESPACE, {
    defaultValue: false,
    persistent: false,
  });

  const argv = minimist(process.argv.slice(2));

  const OBS_ENABLE = argv.obs || false;
  const OBS_URL = argv.obsUrl || "ws://127.0.0.1:4444";
  const OBS_PASSWORD = argv.obsPassword || undefined;

  if (OBS_ENABLE) {
    const obs = new OBSWebSocket();

    function reconnectToOBS() {
      connectToOBSUrl(nodecg, obs, OBS_URL, OBS_PASSWORD)
        .then(() => {
          obsConnected.value = true;
        })
        .catch(() => {
          obsConnected.value = false;
        });
    }

    function createSceneList(scenes: any[]): string[] {
      return scenes
        .sort((a, b) => Number(b.sceneIndex) - Number(a.sceneIndex))
        .map((scene) => String(scene.sceneName) ?? "")
        .filter((sceneName) => !sceneName.match(/^@/));
    }

    obs.on("ConnectionClosed", () => {
      setTimeout(() => {
        reconnectToOBS();
      }, RECONNECT_INTERVAL);
    });
    obs.on("Identified", () => {
      obs.call("GetSceneList").then((args) => {
        obsCurrentScene.value = args.currentProgramSceneName;
        obsScenes.value = createSceneList(args.scenes);
      });
    });
    obs.on("CurrentProgramSceneChanged", (args) => {
      obsCurrentScene.value = args.sceneName;
    });
    obs.on("SceneNameChanged", (args) => {
      const idx = obsScenes.value.findIndex(
        (sceneName) => sceneName === args.oldSceneName
      );
      if (idx < 0) return;
      obsScenes.value[idx] = args.sceneName;
      if (obsCurrentScene.value === args.oldSceneName) {
        obsCurrentScene.value = args.sceneName;
      }
    });
    obs.on("SceneListChanged", (args) => {
      obsScenes.value = createSceneList(args.scenes);
    });
    obs.on("SceneRemoved", (args) => {
      obsScenes.value = obsScenes.value.filter(
        (sceneName) => sceneName !== args.sceneName
      );
    });

    nodecg.listenFor("obs:changeCurrentScene", (message, cb) => {
      if (!message.sceneName) return;
      if (!obs.identified) return;

      obs.call("SetCurrentProgramScene", {
        sceneName: message.sceneName,
      });
      if (cb && !cb.handled) cb();
    });

    // obs.on("SceneTransitionStarted", (args) => {
    //   console.log(args.transitionName);
    // });
    // obs.on("MediaInputPlaybackEnded", (args) => {
    //   console.log(args.inputName);
    // });

    reconnectToOBS();
  }

  nodecg.log.info("OBS: initialized");

  return {
    obsScenes,
    obsCurrentScene,
    obsConnected,
  };
}
