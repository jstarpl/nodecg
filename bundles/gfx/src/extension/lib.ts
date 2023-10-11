import { TEAMS } from "common/data/teams";
import { setTimeout } from "timers";

export function sleep(time: number) {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
}

export function findLogo(teamName: string) {
  var buf = teamName.split(" ");
  buf.pop();
  var shortTeam = buf.join(" ");
  var team = TEAMS.find((i) => {
    var buf = i.name.replace("$", " ").split(" ");
    buf.pop();
    return buf.join(" ").toUpperCase() === shortTeam.toUpperCase();
  });
  if (team) {
    return team.logo;
  }
  return "UNKOWN";
}
