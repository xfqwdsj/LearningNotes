function base(href: string, suffix: string): string {
  return `${href.endsWith("/") ? href : `${href}/`}${suffix}`;
}

export function questionResourceUrl(href: string): string {
  return base(href, "questions.json");
}

export function problemSetMarkdownUrl(href: string, id: string): string {
  return base(href, `questions/sets/${id}.md`);
}

export function questionMarkdownUrl(href: string, target: string): string {
  return base(href, `questions/${target}.md`);
}
