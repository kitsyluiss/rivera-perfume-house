/**
 * Returns a human-readable relative time string for a given date.
 * Falls back to the full locale date for anything older than 6 days.
 *
 * Examples:
 *   "just now"      < 60 seconds ago
 *   "2 minutes ago" < 1 hour ago
 *   "3 hours ago"   < 24 hours ago
 *   "yesterday"     previous calendar day
 *   "3 days ago"    < 7 days ago
 *   "Jul 16, 2026"  everything older
 */
export function relativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? "s" : ""} ago`;
  if (diffHr < 24) return `${diffHr} hour${diffHr !== 1 ? "s" : ""} ago`;
  if (diffDay === 1) return "yesterday";
  if (diffDay < 7) return `${diffDay} days ago`;

  return date.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Full date string for use in tooltips / title attributes */
export function fullDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-PH", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
