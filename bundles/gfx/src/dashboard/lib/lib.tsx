export function removeFormattingChars(text: string) {
  return text.replace(/\$/, " ").replace(/%/, " ");
}

export function insertIntoArray(source: string[], index: number, value: string): string[] {
  const newArray = source.slice()
  if (newArray.length - 1 < index) {
    newArray.fill("", newArray.length, newArray.length + index)
  }
  newArray.splice(index, 1, value)
  return newArray
}