// at the time of writing this code, Bun.file does not work

import { existsSync } from "fs";
import { writeFile, readFile } from "fs/promises";

export async function get(): Promise<string> {
  if (!existsSync("word.txt")) return "";
  else return clean(await readFile("word.txt", "utf8"));
}

export async function save(word: string): Promise<void> {
  await writeFile("word.txt", clean(word));
}

export function clean(word: string): string {
  return (
    word
      .toLowerCase()
      .match(/[a-z0-9-]/gi)
      ?.join("")
      .slice(0, 15) ?? ""
  );
}
