const HASH_PLACEHOLDER = 'xhashx';

export function titleToSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/#/g, HASH_PLACEHOLDER)
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

export function slugToTitle(slug: string): string {
  return slug
    .replace(new RegExp(HASH_PLACEHOLDER, 'g'), '#')
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
