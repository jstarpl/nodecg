import { TEAMS } from "common/data/teams";
import { findLogo } from "../lib";
import { JSDOM } from "jsdom";
import fetch from "node-fetch";

const URL = "https://plk.pl/terminarz-i-wyniki.html";

export async function getData(round: string): Promise<object[]> {
  const dom = await JSDOM.fromURL(URL);

  try {
    return getFixturesData(dom, round);
  } catch (e) {
    throw new Error(`Could not find #main-data: ${e}`);
  }
}

async function getFixturesData(dom: JSDOM, round: string): Promise<object[]> {
  const result: any[] = [];
  let target: Element | null = null;

  const headers = dom.window.document.querySelectorAll("h3");
  for (let header of headers) {
    const m = header.innerHTML?.match(/(\d+) kolejka/);
    if (m && m[1] === String(round).trim()) {
      target = header.nextElementSibling;
    }
  }

  if (target === null) {
    nodecg.log.error("Could not find target table");
    return [];
  }

  const rows = target.querySelectorAll("tbody > tr");
  rows.forEach((row) => {
    const teamName1 =
      row.querySelector('span[itemprop="homeTeam"]')?.innerHTML.trim() ?? "";
    const teamName2 =
      row.querySelector('span[itemprop="awayTeam"]')?.innerHTML.trim() ?? "";
    let time =
      row.querySelector("td.wynik > div.below-sm")?.innerHTML.trim() ?? "";
    const matchResult =
      row.querySelector("td.wynik > a")?.innerHTML.trim() ?? "";

    time = time?.replace(/(\d+).(\d+).(\d+)/, "$1.$2");
    let timeOrResult = time;
    if (matchResult !== "--:--" && matchResult !== "") {
      timeOrResult = matchResult;
    }

    result.push({
      teamName1,
      teamName2,
      logo1: findLogo(teamName1),
      logo2: findLogo(teamName2),
      timeOrResult: timeOrResult,
    });
  });

  return result;
}
