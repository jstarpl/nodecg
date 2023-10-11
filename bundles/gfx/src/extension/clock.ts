import { setInterval, clearInterval } from "timers";
import { NodeCG, Replicant } from "../../../../types/server";
import { NAMESPACE } from "./namespace";

const TIME_MATCH = /^(?:(?:(\d+):)?(\d+):)?(\d+)$/;

export function clock(nodecg: NodeCG, clock: Replicant<string>) {
  let lastTick: number = 0;
  let interval: NodeJS.Timeout | undefined = undefined;
  let clockBuffer: number = 0;

  const clockState = nodecg.Replicant("system:clockState", NAMESPACE, {
    defaultValue: false,
    persistent: false,
  });
  const clockDirection = nodecg.Replicant("system:clockDirection", NAMESPACE, {
    defaultValue: 1,
  });
  const clockShowHours = nodecg.Replicant("system:clockShowHours", NAMESPACE, {
    defaultValue: false,
  });
  const clockResetValue = nodecg.Replicant(
    "system:clockResetValue",
    NAMESPACE,
    {
      defaultValue: "0:00",
    }
  );

  function formatClock(value: number): string {
    let hours = 0;
    let minutes = 0;
    if (clockShowHours.value === true) {
      hours = Math.floor(value / (3600 * 1000));
      minutes = Math.floor((value / (60 * 1000)) % 60);
    } else {
      minutes = Math.floor(value / (60 * 1000));
    }
    const seconds = Math.floor((value / 1000) % 60);

    let result = "";
    if (hours > 0) result += `${hours}:`;
    result +=
      hours > 0 ? `${minutes.toString().padStart(2, "0")}:` : `${minutes}:`;
    result += seconds.toString().padStart(2, "0");

    return result;
  }

  function parseClock(value: string): number {
    const match = value.trim().match(TIME_MATCH);
    if (!match) return 0;
    const hours = Number.parseInt(match[1]) || 0;
    const minutes = Number.parseInt(match[2]) || 0;
    const seconds = Number.parseInt(match[3]) || 0;

    return (hours * 3600 + minutes * 60 + seconds) * 1000;
  }

  function startClock() {
    if (interval) return;
    interval = setInterval(() => {
      const now = Date.now();
      const diff = now - lastTick;
      clockBuffer = Math.max(
        0,
        clockBuffer + diff * Number.parseInt(String(clockDirection.value))
      );
      clock.value = formatClock(clockBuffer);
      lastTick = now;
    }, 250);
    lastTick = Date.now();
    clockBuffer = parseClock(clock.value);
    clockState.value = true;
  }

  function stopClock() {
    if (interval === undefined) return;
    clearInterval(interval);
    interval = undefined;
    clockState.value = false;
  }

  function resetClock() {
    stopClock();
    clock.value = formatClock(parseClock(clockResetValue.value));
  }

  function nudgeClock(nudgeAmount: number) {
		if (clockState.value !== true) return;
		clockBuffer = Math.max(0, clockBuffer + nudgeAmount);
	}

  nodecg.listenFor("system:clock:start", startClock);
  nodecg.listenFor("system:clock:stop", stopClock);
  nodecg.listenFor("system:clock:reset", resetClock);
  nodecg.listenFor("system:clock:nudge", nudgeClock);

  nodecg.log.info("Clock: initialized");

  return {
    start: startClock,
    stop: stopClock,
    reset: resetClock,
    clockState,
    clockDirection,
    clockResetValue,
    clockShowHours,
  };
}
