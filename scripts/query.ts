import { localizedTitle } from "@/lib/content/taxonomy";
import { defaultLocale } from "@/i18n/config";
import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import type { SearchDocument } from "@/lib/content/types";
const args = process.argv.slice(2);
const online = args.includes("--online");
const privateContent = args.includes("--private");
const query = args
  .filter((arg) => !arg.startsWith("--"))
  .join(" ")
  .toLocaleLowerCase();
let source: string;
if (online) {
  const url = `${process.env["SITE_URL"] ?? "https://learning.ltfan.top"}${privateContent ? "/private" : ""}/search.json`;
  if (privateContent) {
    const result = spawnSync("cloudflared", ["access", "curl", url], {
      encoding: "utf8",
      stdio: ["inherit", "pipe", "inherit"],
    });
    if (result.error || result.status !== 0)
      throw new Error(
        "Install cloudflared with user authorization, then complete Access login.",
      );
    source = result.stdout;
  } else {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    source = await response.text();
  }
} else
  source = await readFile(
    `.generated/${privateContent ? "private" : "public"}/search.json`,
    "utf8",
  );
const documents = JSON.parse(source) as SearchDocument[];
console.log(
  JSON.stringify(
    documents
      .filter((doc) =>
        `${doc.title.text} ${doc.id ?? ""} ${Object.values(doc.subjectTitles)
          .map((value) => value.text)
          .join(" ")} ${Object.values(doc.courseTitles)
          .map((value) => value.text)
          .join(" ")} ${doc.text}`
          .toLocaleLowerCase()
          .includes(query),
      )
      .map((doc) => ({
        title: doc.title,
        href: doc.href,
        subject: doc.subject,
        subjectTitle: localizedTitle(doc.subjectTitles, defaultLocale),
        course: doc.course,
        ...(doc.course
          ? { courseTitle: localizedTitle(doc.courseTitles, defaultLocale) }
          : {}),
        kind: doc.kind,
        id: doc.id,
        taskType: doc.taskType,
      })),
    null,
    2,
  ),
);
