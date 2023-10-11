export function getNames(fullName: string): { surname: string; names: string } {
  const nameParts = fullName.split(" ");
  const surname = nameParts.pop() ?? "\xa0";
  const names = nameParts.join(" ") ?? "\xa0";
  return { surname, names };
}
