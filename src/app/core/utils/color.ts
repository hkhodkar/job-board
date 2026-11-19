const PALETTE = ['#2f6fed', '#0e7490', '#15803d', '#7c3aed', '#b45309', '#db2777', '#4f46e5', '#be123c', '#0f766e'];

export function colorFor(value: string): string {
  let hash = 0;
  for (const ch of value) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

export function initials(name: string): string {
  const words = name
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);
  if (!words.length) return '?';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}
