import { findLogo } from "../lib";
import { JSDOM } from "jsdom";

const URL = "https://plk.pl/tabele.html";

export async function getData(): Promise<object[]> {
  const dom = await JSDOM.fromURL(URL);

  try {
    return getStandingsData(dom);
  } catch (e) {
    throw new Error(`Could not find #main-data: ${e}`);
  }
}

async function getStandingsData(dom: JSDOM): Promise<object[]> {
  const result: any[] = [];
  const rows = dom.window.document.querySelectorAll(
    "#tabele-tbl .tab.tab0 tbody > tr"
  );
  rows.forEach((row) => {
    const position =
      row.querySelector("td.miejsce.rght")?.innerHTML.trim() ?? "";
    const teamName = (
      row.querySelector("td.druzyna a")?.innerHTML.trim() ?? ""
    ).trim();
    const logo = findLogo(teamName);
    const pkt =
      row.querySelector("td.cntr:nth-child(4)")?.innerHTML.trim() ?? "";
    const mecze =
      row.querySelector("td.cntr:nth-child(5)")?.innerHTML.trim() ?? "";
    const zwPor =
      row.querySelector("td.cntr:nth-child(6)")?.innerHTML.trim() ?? "";
    const diff =
      row.querySelector("td.cntr:nth-child(10)")?.innerHTML.trim() ?? "";

    result.push({
      position,
      logo,
      teamName,
      pkt,
      mecze,
      zwPor,
      diff,
    });
  });

  return result;
}
