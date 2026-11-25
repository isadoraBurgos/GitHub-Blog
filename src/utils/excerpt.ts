const CODE_BLOCK = /```[\s\S]*?```/g;
const INLINE_CODE = /`([^`]+)`/g;
const IMAGE = /!\[([^\]]*)\]\([^)]*\)/g;
const LINK = /\[([^\]]*)\]\([^)]*\)/g;
const MARKERS = /[#>*_~]+/g;
const WHITESPACE = /\s+/g;

/** Resumo do corpo Markdown para os cards (RF-07). */
export function excerpt(body: string | null, maxLength = 160): string {
  if (!body) {
    return '';
  }

  const text = body
    .replace(CODE_BLOCK, ' ')
    .replace(INLINE_CODE, '$1')
    .replace(IMAGE, '$1')
    .replace(LINK, '$1')
    .replace(MARKERS, ' ')
    .replace(WHITESPACE, ' ')
    .trim();

  if (text.length <= maxLength) {
    return text;
  }

  const slice = text.slice(0, maxLength);
  const lastSpace = slice.lastIndexOf(' ');

  return `${(lastSpace > 0 ? slice.slice(0, lastSpace) : slice).trimEnd()}…`;
}
