import { demoCatalog } from "@/demos/catalog";
import { locales as uiLocales } from "@/i18n/config";
import type { DemoManifest } from "@/demos/types";
import {
  markdownPlainText,
  parseMarkdownFragment,
  renderMarkdownValue,
  renderMarkdownSource,
} from "@/lib/markdown/render";
import { createHash } from "node:crypto";
import {
  buildTaxonomy,
  directoryMetadata,
  resolveDirectories,
  type RawDirectory,
  type TermSource,
} from "./taxonomy";
import { requireTerm, taxonHref, termTitles } from "@/lib/content/taxonomy";
import { documentDemos, demoAssets } from "./demo-assets";
import { DEFAULT_PROBLEM_SET_ID } from "@/lib/content/learning-types";
import type { QuestionData } from "@/lib/content/learning-types";
import type { QuestionResource } from "@/lib/content/learning-types";
import {
  problemSetMarkdownUrl,
  questionMarkdownUrl,
  questionResourceUrl,
} from "@/lib/content/learning-routes";
import { localizedContentPath } from "@/lib/content/localization";
import { canonicalContentLocale, contentLocalePrefix } from "@/i18n/config";
import { createUiTranslator } from "@/i18n/translate";
import { defaultContentLocale } from "@/i18n/config";
const t = createUiTranslator();
import { selectSummary } from "@/lib/content/summary";
import {
  createSourceResolver,
  type InclusionReference,
} from "@/lib/content/source-resolver";
import { renderSource } from "@/lib/content/source-render";
import { sourceSections } from "@/lib/content/source-sections";
import {
  createExportFragment,
  exportMarkdown,
} from "@/lib/content/content-export";
import { compileExercises } from "@/lib/content/exercises";
import { gitDates } from "@/lib/content/git-dates";
import {
  rm,
  readdir,
  readFile,
  writeFile,
  mkdir,
  stat,
} from "node:fs/promises";
import path from "node:path";
import { parseFrontMatter } from "@/lib/content/front-matter";
import { z } from "zod";
import { toString } from "mdast-util-to-string";
import { renderSummary, slugify } from "@/lib/content/compile";
import type {
  Catalog,
  Document,
  ReferenceLocation,
  SearchDocument,
} from "@/lib/content/types";
import type { Root, RootContent } from "mdast";

function searchText(tree: Root): string {
  const copy = structuredClone(tree);
  const strip = (nodes: RootContent[]): RootContent[] =>
    nodes.flatMap((node) => {
      if (node.type === "containerDirective" && node.name === "inclusion")
        return [];
      if ("children" in node)
        return [
          {
            ...node,
            children: strip(node.children as RootContent[]),
          } as RootContent,
        ];
      return [node];
    });
  copy.children = strip(copy.children);
  return markdownPlainText(copy);
}

function referenceLocation(
  reference: InclusionReference,
  host: Document,
): ReferenceLocation {
  const hostSection = reference.hostSectionId
    ? host.sections.find((section) => section.id === reference.hostSectionId)
    : undefined;
  return {
    href: `${reference.hostHref}#${reference.anchor}`,
    title: host.title,
    ...(hostSection
      ? { section: hostSection.title }
      : reference.hostSectionTitle
        ? {
            section: renderMarkdownSource(reference.hostSectionTitle, {
              mode: "single-line",
              linkPolicy: "plain",
            }),
          }
        : {}),
  };
}

function compareReferences(a: ReferenceLocation, b: ReferenceLocation) {
  return (
    a.title.text.localeCompare(b.title.text, defaultContentLocale, {
      numeric: true,
    }) ||
    (a.section?.text ?? "").localeCompare(
      b.section?.text ?? "",
      defaultContentLocale,
      {
        numeric: true,
      },
    )
  );
}

const metadata = z.object({
  order: z.number().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  imageCaptions: z.enum(["alt", "none"]).default("alt"),
  kind: z.enum(["knowledge", "course-note", "task", "article"]),
  subject: z.string().default("general"),
  course: z.string().default(""),
  lang: z
    .string()
    .transform(canonicalContentLocale)
    .default(defaultContentLocale),
  id: z.string().optional(),
  taskType: z.enum(["exercise", "exam", "quiz", "assignment"]).optional(),
  tags: z.array(z.string()).default([]),
  showDates: z.boolean().optional(),
  summaries: z.record(z.string(), z.string()).default({}),
});
type Source = {
  file: string;
  relative: string;
  contentPath: string;
  body: string;
  data: z.infer<typeof metadata>;
  private: boolean;
};
export async function walk(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((entry) =>
        entry.isDirectory()
          ? walk(path.join(dir, entry.name))
          : Promise.resolve([path.join(dir, entry.name)]),
      ),
    )
  ).flat();
}
const root = process.cwd();
export interface PrepareOptions {
  outputDirectory?: string;
  publicContentDirectory?: string;
  privateContentDirectory?: string;
}
async function load(
  dir: string,
  privateContent: boolean,
): Promise<{
  sources: Source[];
  directories: RawDirectory[];
  terms: TermSource[];
}> {
  const entries = await walk(dir);
  const unsupported = entries.find((file) => file.endsWith(".md"));
  if (unsupported)
    throw new Error(`Content sources must use MDX: ${unsupported}`);
  const files = entries.filter((file) => /\.mdx$/.test(file));
  const sources: Source[] = [];
  const directoryPaths = new Set<string>();
  const directories: RawDirectory[] = [];
  const terms: TermSource[] = [];
  for (const file of files) {
    const { data, content } = parseFrontMatter(await readFile(file, "utf8"));
    const relative = path.relative(dir, file).replaceAll(path.sep, "/");
    const localized = localizedContentPath(relative);
    if (path.basename(file) === "_index.mdx") {
      directoryPaths.add(path.dirname(relative));
      const info = directoryMetadata.parse(data);
      const directory =
        path.dirname(localized.path) === "."
          ? ""
          : path.dirname(localized.path);
      if (
        privateContent &&
        (directory === "subjects" || directory.startsWith("subjects/"))
      )
        throw new Error(
          "Private content cannot define subjects or courses; place taxonomy entries in the public content/subjects directory.",
        );
      if (directory === "subjects") continue;
      if (directory.startsWith("subjects/")) {
        const parts = directory.split("/");
        const [, subject, course] = parts;
        if (
          parts.length > 3 ||
          !subject ||
          !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(subject) ||
          (course && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(course))
        )
          throw new Error(`Invalid taxonomy path: ${relative}`);
        if (!info.title || !info.description)
          throw new Error(
            `Taxonomy requires title and description: ${relative}`,
          );
        terms.push({
          file,
          contentPath: localized.path,
          body: content,
          private: privateContent,
          data: { kind: "article", lang: localized.locale, title: info.title },
          term: {
            kind: course ? "course" : "subject",
            subject,
            id: course ?? subject,
            description: info.description,
            ...(info.icon ? { icon: info.icon } : {}),
            ...(info.order === undefined ? {} : { order: info.order }),
          },
        });
      } else {
        if (info.icon)
          throw new Error(
            `Taxonomy icons belong in subjects metadata: ${relative}`,
          );
        directories.push({
          path: directory,
          lang: localized.locale,
          ...(info.title ? { title: info.title } : {}),
          ...(info.description ? { description: info.description } : {}),
          ...(info.order === undefined ? {} : { order: info.order }),
        });
      }
      continue;
    }
    const parts = localized.path.replace(/\.mdx$/, "").split("/");
    const [collection, subject = "general", course = "", type = "", id = ""] =
      parts;
    const kind = (
      {
        knowledge: "knowledge",
        courses: "course-note",
        tasks: "task",
        articles: "article",
      } as Record<string, string>
    )[collection ?? ""];
    if (
      !kind ||
      (kind === "task" && parts.length !== 5) ||
      (kind === "course-note" && parts.length !== 4)
    )
      throw new Error(`Invalid content path: ${relative}`);
    const inferred = {
      kind,
      subject: collection === "articles" ? "general" : subject,
      course: collection === "courses" || collection === "tasks" ? course : "",
      ...(kind === "task" ? { taskType: type, id } : {}),
    };
    for (const field of [
      "lang",
      "kind",
      "subject",
      "course",
      "taskType",
      "id",
      "slug",
      "aliases",
      "createdAt",
      "updatedAt",
      "date",
    ])
      if (field in data)
        throw new Error(`Metadata ${field} duplicates the path: ${relative}`);
    sources.push({
      file,
      relative,
      contentPath: localized.path,
      body: content,
      data: metadata.parse({
        ...data,
        ...inferred,
        lang: localized.locale,
      }),
      private: privateContent,
    });
  }
  for (const source of sources) {
    let folder = path.dirname(source.relative);
    while (folder !== ".") {
      if (!directoryPaths.has(folder))
        throw new Error(`Missing directory description: ${folder}/_index.mdx`);
      folder = path.dirname(folder);
    }
  }
  return { sources, directories, terms };
}
export async function prepare(options: PrepareOptions = {}): Promise<void> {
  const outputDirectory = path.resolve(
    options.outputDirectory ??
      process.env["LEARNING_GENERATED_DIR"] ??
      path.join(root, ".generated"),
  );
  const publicContentDirectory = path.resolve(
    options.publicContentDirectory ??
      process.env["LEARNING_CONTENT_DIR"] ??
      path.join(root, "content"),
  );
  const publicContent = await load(publicContentDirectory, false);
  const privateRoot = path.resolve(
    process.env["PRIVATE_CONTENT_DIR"] ??
      path.resolve(root, "../LearningNotes-Private"),
  );
  const privateContentDirectory = path.resolve(
    options.privateContentDirectory ?? path.join(privateRoot, "content"),
  );
  let privateContent: Awaited<ReturnType<typeof load>> = {
    sources: [],
    directories: [],
    terms: [],
  };
  try {
    await stat(privateContentDirectory);
    privateContent = await load(privateContentDirectory, true);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    console.info(
      "Private checkout unavailable; public build remains available.",
    );
  }
  const all = [...publicContent.sources, ...privateContent.sources];
  const keys = new Set<string>();
  const publicTaxonomy = await buildTaxonomy(publicContent.terms);
  const privateTaxonomy = publicTaxonomy;
  const publicDirectories = resolveDirectories(
    publicContent.directories,
    publicTaxonomy,
  );
  const privateDirectories = resolveDirectories(
    privateContent.directories,
    privateTaxonomy,
  );
  const resolver = createSourceResolver([...all, ...publicContent.terms]);
  for (const source of publicContent.terms) {
    const term = requireTerm(
      publicTaxonomy,
      source.term.subject,
      source.term.kind === "course" ? source.term.id : undefined,
    );
    const resolved = resolver.resolve(source);
    const html = await renderSource(resolved, {
      imageCaptions: source.data.imageCaptions ?? "alt",
    });
    const text = term.labels[source.data.lang]!;
    term.labels[source.data.lang] = {
      ...text,
      html,
      markdown: exportMarkdown(resolved),
      text: markdownPlainText(resolved),
      demos: documentDemos({
        html,
        href: `${source.private ? "/private" : ""}${contentLocalePrefix(source.data.lang)}${taxonHref(term)}`,
        title: text.title,
        private: source.private,
        sections: [],
        kind: source.data.kind,
      }),
    };
  }
  const hrefFor = resolver.href;
  const directories = [...publicDirectories, ...privateDirectories];
  const pathOrder = (source: Source): number[] => {
    const parts = path.dirname(source.contentPath).split("/");
    return parts.map(
      (_, i) =>
        directories.find(
          (item) => item.path === parts.slice(0, i + 1).join("/"),
        )?.order ?? 1000,
    );
  };
  all.sort((a, b) => {
    const ao = pathOrder(a);
    const bo = pathOrder(b);
    for (let i = 0; i < Math.max(ao.length, bo.length); i++) {
      const diff = (ao[i] ?? 1000) - (bo[i] ?? 1000);
      if (diff) return diff;
    }
    return (
      (a.data.order ?? 1000) - (b.data.order ?? 1000) ||
      a.contentPath.localeCompare(b.contentPath, defaultContentLocale, {
        numeric: true,
      })
    );
  });
  const documents: Document[] = [];
  const inclusionReferences: InclusionReference[] = [];
  const searchTexts = new Map<string, string>();
  for (const source of all) {
    const data = source.data;
    const relative = source.contentPath.replace(/\.mdx$/, "");
    if (data.kind === "task" && (!data.taskType || !data.id || !data.course))
      throw new Error(`Task requires course, type and string ID: ${relative}`);
    const key = `${relative}/${data.lang}`;
    if (keys.has(key)) throw new Error(`Duplicate content identity: ${key}`);
    keys.add(key);
    const href = hrefFor(source);
    const markdownUrl = `${href.slice(0, -1)}.md`;
    const resolved = resolver.resolve(source, [], "", undefined, (reference) =>
      inclusionReferences.push(reference),
    );
    searchTexts.set(key, searchText(resolved));
    const sectionSources = sourceSections(resolved);
    const problemSets = await compileExercises(resolved, renderSource, {
      sectionsPrepared: true,
    });
    const exported = createExportFragment(resolved);
    const markdown = exported.markdown;
    const plain = toString(exported.tree);
    const titleFragment = parseMarkdownFragment(data.title);
    const summary =
      selectSummary(exported.tree, data.description) ?? titleFragment;
    const descriptionHtml = await renderSummary(summary, {
      imageCaptions: data.imageCaptions,
    });
    const html = await renderSource(resolved, {
      imageCaptions: source.data.imageCaptions ?? "alt",
    });
    const title = renderMarkdownValue(titleFragment, {
      mode: "single-line",
      linkPolicy: "plain",
    });
    const sections = await Promise.all(
      sectionSources.map(async ({ section, tree }) => {
        const summary = data.summaries[section.id];
        return {
          ...section,
          summary: summary
            ? renderMarkdownSource(summary, { mode: "summary" })
            : section.summary,
          html: await renderSource(tree),
          markdownUrl: `${href}sections/${section.id}.md`,
        };
      }),
    );
    const taxonomy = source.private ? privateTaxonomy : publicTaxonomy;
    const subjectTerm = requireTerm(taxonomy, data.subject);
    const courseTerm = data.course
      ? requireTerm(taxonomy, data.subject, data.course)
      : undefined;
    documents.push({
      key,
      subjectTitles: termTitles(subjectTerm),
      courseTitles: courseTerm ? termTitles(courseTerm) : {},
      ...(data.order !== undefined ? { order: data.order } : {}),
      title,
      description: {
        ...renderMarkdownValue(summary, { mode: "summary" }),
        html: descriptionHtml,
      },
      kind: data.kind,
      subject: data.subject,
      course: data.course,
      lang: data.lang,
      slug:
        data.kind === "knowledge"
          ? path.basename(relative, path.extname(relative))
          : slugify(data.title),
      path: relative,
      href,
      markdownUrl,
      private: source.private,
      tags: data.tags.map((tag) =>
        renderMarkdownSource(tag, {
          mode: "single-line",
          linkPolicy: "plain",
        }),
      ),
      markdown: `# ${data.title}\n\n${markdown}`,
      text: markdownPlainText(resolved),
      html,
      sections,
      problemSets,
      demos: documentDemos({
        html,
        href,
        title,
        private: source.private,
        sections,
        kind: data.kind,
      }),
      readingMinutes: Math.max(1, Math.ceil(plain.length / 450)),
      ...(data.taskType ? { taskType: data.taskType } : {}),
      ...(data.id ? { id: data.id } : {}),
      showDates: data.showDates ?? data.kind === "article",
      ...gitDates(source.file),
    });
  }
  const documentsByFile = new Map(
    all.map((source, index) => [source.file, documents[index]!] as const),
  );
  // Public references are attached first; private references are only added
  // afterwards, so the already written public catalog cannot expose them.
  async function attachReferences(mode: "public" | "private") {
    for (const reference of inclusionReferences) {
      if (mode === "public" && reference.host.private) continue;
      if (mode === "private" && !reference.host.private) continue;
      const target = documentsByFile.get(reference.target.file);
      const host = documentsByFile.get(reference.host.file);
      if (!target || !host) continue;
      const rawLocation = referenceLocation(reference, host);
      const location = rawLocation;
      if (reference.sourceSectionId) {
        const section = target.sections.find(
          (item) => item.id === reference.sourceSectionId,
        );
        if (section) (section.references ??= []).push(location);
      } else {
        (target.references ??= []).push({
          ...location,
          ...(reference.sourceSectionTitle
            ? { sourceSection: target.title }
            : {}),
        });
      }
    }
    for (const document of documents) {
      document.references?.sort(compareReferences);
      for (const section of document.sections)
        section.references?.sort(compareReferences);
    }
  }
  for (const mode of ["public", "private"] as const) {
    await attachReferences(mode);
    const selected = documents.filter(
      (document) => document.private === (mode === "private"),
    );
    const catalog: Catalog = {
      version: 2,
      taxonomy: mode === "public" ? publicTaxonomy : privateTaxonomy,
      documents: selected,
      directories: mode === "public" ? publicDirectories : privateDirectories,
    };
    const target = path.join(outputDirectory, mode);
    await rm(target, { recursive: true, force: true });
    await mkdir(target, { recursive: true });
    await writeFile(path.join(target, "catalog.json"), JSON.stringify(catalog));
    const search: SearchDocument[] = await Promise.all(
      selected.map(
        async ({
          key,
          title,
          description,
          kind,
          subject,
          course,
          subjectTitles,
          courseTitles,
          href,
          private: isPrivate,
          lang,
          taskType,
          id,
          sections,
          references,
        }) => {
          const searchReferences = [
            ...(references ?? []),
            ...sections.flatMap((section) =>
              (section.references ?? []).map((reference) => ({
                ...reference,
                sourceSection: section.title,
              })),
            ),
          ];
          return {
            version: 2 as const,
            key,
            title,
            description,
            kind,
            subject,
            course,
            subjectTitles,
            courseTitles,
            href,
            private: isPrivate,
            lang,
            text: searchTexts.get(key)!,
            ...(searchReferences.length
              ? { references: searchReferences }
              : {}),
            ...(taskType ? { taskType } : {}),
            ...(id ? { id } : {}),
          };
        },
      ),
    );
    await writeFile(path.join(target, "search.json"), JSON.stringify(search));
    const assets = path.join(target, "assets");
    await mkdir(assets, { recursive: true });
    const put = async (href: string, content: string) => {
      const relative = href.replace(/^\/private(?=\/)/, "").replace(/^\//, "");
      const dest = path.join(assets, relative);
      await mkdir(path.dirname(dest), { recursive: true });
      await writeFile(dest, content);
    };
    await put("/search.json", JSON.stringify(search));
    await put(
      "/taxonomy.json",
      JSON.stringify({
        version: 2,
        terms: catalog.taxonomy.map((term) => ({
          kind: term.kind,
          id: term.id,
          subject: term.subject,
          icon: term.icon,
          order: term.order,
          labels: Object.fromEntries(
            Object.entries(term.labels).map(([lang, text]) => [
              lang,
              {
                title: text.title,
                description: text.description,
                href: `${mode === "private" ? "/private" : ""}${contentLocalePrefix(lang)}${taxonHref(term)}`,
                markdown: `${mode === "private" ? "/private" : ""}${contentLocalePrefix(lang)}${taxonHref(term).slice(0, -1)}.md`,
              },
            ]),
          ),
        })),
      }),
    );
    for (const term of catalog.taxonomy)
      for (const [lang, text] of Object.entries(term.labels))
        await put(
          `${contentLocalePrefix(lang)}${taxonHref(term).slice(0, -1)}.md`,
          `# ${text.title.markdown}\n\n${text.description.markdown}\n\n${text.markdown?.trim() ?? ""}\n`,
        );
    await put("/access.json", JSON.stringify({ version: 2, scope: mode }));
    const prefix = mode === "private" ? "/private" : "";
    const demoLocales = [
      ...new Set([
        ...uiLocales,
        ...Object.values(demoCatalog).flatMap((demo) =>
          Object.keys(demo.translations),
        ),
        ...catalog.taxonomy.flatMap((term) => Object.keys(term.labels)),
      ]),
    ].sort();
    const manifest: DemoManifest = {
      version: 5,
      count: Object.keys(demoCatalog).length,
      locales: {},
    };
    for (const locale of demoLocales) {
      const demos = demoAssets(
        mode === "private" ? documents : selected,
        prefix,
        catalog.taxonomy,
        locale,
      );
      const resources = demos.manifest.locales[locale]!;
      manifest.locales[locale] = resources;
      if (locale === defaultContentLocale)
        await put("/demos/index.json", JSON.stringify(demos.index));
      await put(`/demos/${locale}/index.json`, JSON.stringify(demos.index));
      await put(resources.catalog, JSON.stringify(demos.catalog));
      await put(resources.index, JSON.stringify(demos.list));
      await Promise.all(
        demos.records.map((record, index) =>
          put(demos.list.entries[index]!.href, JSON.stringify(record)),
        ),
      );
    }
    await writeFile(
      path.join(target, "demo-manifest.json"),
      JSON.stringify(manifest),
    );
    const rootIndex = {
      version: 3,
      description: t("index.description"),
      demos: `${prefix}/demos/index.json`,
      taxonomy: `${prefix}/taxonomy.json`,
      directories: catalog.directories
        .filter((dir) => !dir.path.includes("/"))
        .map((dir) => ({
          ...dir,
          index: `${prefix}${contentLocalePrefix(dir.lang ?? defaultContentLocale)}/index/${dir.path || "root"}.json`,
        })),
      index: `${prefix}/index/root.json`,
    };
    await put("/index.json", JSON.stringify(rootIndex));
    for (const directory of catalog.directories) {
      const children = catalog.directories.filter(
        (item) =>
          path.dirname(item.path) === (directory.path || ".") &&
          item.path !== directory.path &&
          (item.lang ?? defaultContentLocale) ===
            (directory.lang ?? defaultContentLocale),
      );
      const locale = directory.lang ?? defaultContentLocale;
      const indexBase = `${prefix}${contentLocalePrefix(locale)}/index/${directory.path || "root"}`;
      const entries = await Promise.all(
        selected
          .filter(
            (doc) =>
              path.dirname(doc.path) === directory.path && doc.lang === locale,
          )
          .map(async (doc) => {
            const digest = createHash("sha256")
              .update(doc.key)
              .digest("hex")
              .slice(0, 16);
            const entry = `${indexBase}/entries/${digest}.json`;
            await put(
              entry,
              JSON.stringify({
                version: 3,
                title: doc.title,
                href: doc.href,
                markdown: doc.markdownUrl,
                problemSets: (doc.problemSets ?? []).map((set) => {
                  const summarize = (questions: QuestionData[]): unknown[] =>
                    questions.map((question) => ({
                      id: question.id,
                      target: question.target,
                      number: question.number,
                      href: `${doc.href}#${question.anchor}`,
                      markdown: `${doc.href}questions/${question.target}.md`,
                      parts: summarize(question.parts),
                    }));
                  return {
                    id: set.id,
                    source: set.source,
                    questions: summarize(set.questions),
                  };
                }),
                sections: doc.sections.map(
                  ({ id, title, summary, markdownUrl, slot, origin }) => ({
                    id,
                    title,
                    summary,
                    markdownUrl,
                    ...(slot ? { slot } : {}),
                    ...(origin ? { origin } : {}),
                  }),
                ),
              }),
            );
            return {
              key: doc.key,
              title: doc.title,
              href: doc.href,
              markdown: doc.markdownUrl,
              entry,
            };
          }),
      );
      await put(
        `${indexBase}.json`,
        JSON.stringify({
          ...directory,
          version: 3,
          children: children.map((child) => ({
            ...child,
            index: `${prefix}${contentLocalePrefix(child.lang ?? defaultContentLocale)}/index/${child.path}.json`,
          })),
          entries,
        }),
      );
    }
    for (const doc of selected) {
      await put(doc.markdownUrl, doc.markdown);
      if (doc.problemSets?.length)
        await put(
          questionResourceUrl(doc.href),
          JSON.stringify({
            version: 2,
            problemSets: doc.problemSets,
          } satisfies QuestionResource),
        );
      const exportQuestions = async (
        questions: QuestionData[],
        parentNumber = "",
      ): Promise<void> => {
        for (const [index, question] of questions.entries()) {
          const number = parentNumber
            ? `${parentNumber}.${index + 1}`
            : String(index + 1);
          const title = t(
            parentNumber ? "learning.partTitle" : "learning.questionTitle",
            { title: doc.title.text, number },
          );
          await put(
            questionMarkdownUrl(doc.href, question.target),
            `# ${title}\n\n${question.markdown.trim()}\n\n${t("export.sourceUrl", { url: `${doc.href}#${question.anchor}` })}\n`,
          );
          await exportQuestions(question.parts, number);
        }
      };
      for (const set of doc.problemSets ?? []) {
        if (set.id !== DEFAULT_PROBLEM_SET_ID)
          await put(
            problemSetMarkdownUrl(doc.href, set.id),
            set.markdown.trim(),
          );
        await exportQuestions(set.questions);
      }
      for (const section of doc.sections)
        await put(
          section.markdownUrl,
          `# ${doc.title.markdown}\n\n${section.markdown.trim()}\n\n${t("export.sourceUrl", { url: `${doc.href}#${section.id}` })}\n`,
        );
    }
    await put(
      "/llms.txt",
      t("index.guide", {
        site: t("brand.name"),
        scope: mode === "private" ? t("index.privateSuffix") : "",
        index: `${prefix}/index.json`,
        entries: selected
          .map(
            (doc) =>
              `- [${doc.title.text}](${doc.markdownUrl}): ${doc.description.text.replaceAll("\n", " ").slice(0, 90)}`,
          )
          .join("\n"),
      }),
    );
    console.info(
      `${mode}: ${selected.length} documents, ${selected.reduce((n, doc) => n + doc.sections.length, 0)} sections`,
    );
  }
  const revision = createHash("sha256");
  for (const mode of ["public", "private"]) {
    revision.update(
      await readFile(path.join(outputDirectory, mode, "catalog.json")),
    );
    revision.update(
      await readFile(path.join(outputDirectory, mode, "demo-manifest.json")),
    );
  }
  await writeFile(
    path.join(outputDirectory, "revision.json"),
    JSON.stringify({ version: 2, revision: revision.digest("hex") }),
  );
}
if (process.argv[1]?.endsWith("prepare.ts")) {
  const outputIndex = process.argv.indexOf("--output");
  if (outputIndex >= 0 && !process.argv[outputIndex + 1])
    throw new Error("--output requires a directory");
  await prepare({
    ...(outputIndex >= 0
      ? { outputDirectory: path.resolve(process.argv[outputIndex + 1]!) }
      : {}),
  });
}
