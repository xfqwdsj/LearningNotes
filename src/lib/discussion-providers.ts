export const discussionProviders = [
  {
    id: "chatgpt",
    labelKey: "discussion.providers.chatgpt",
    online: true,
    prefix: "https://chatgpt.com/?hints=search&q=",
  },
  {
    id: "claude",
    labelKey: "discussion.providers.claude",
    online: true,
    prefix: "https://claude.ai/new?q=",
  },
  {
    id: "grok",
    labelKey: "discussion.providers.grok",
    online: true,
    prefix: "https://grok.com/?q=",
  },
  {
    id: "codex",
    labelKey: "discussion.providers.codex",
    online: false,
    prefix: "codex://new?prompt=",
  },
  {
    id: "claude-code",
    labelKey: "discussion.providers.claude-code",
    online: false,
    prefix: "claude-cli://open?q=",
  },
  {
    id: "cursor",
    labelKey: "discussion.providers.cursor",
    online: false,
    prefix: "cursor://anysphere.cursor-deeplink/prompt?text=",
  },
] as const;
export type DiscussionProvider = (typeof discussionProviders)[number];
export function discussionUrl(
  provider: DiscussionProvider,
  prompt: string,
): string {
  return provider.prefix + encodeURIComponent(prompt);
}
