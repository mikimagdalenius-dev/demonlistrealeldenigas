const YT_PATTERNS = [
  /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
];

export function extractYouTubeId(url: string): string | null {
  for (const pattern of YT_PATTERNS) {
    const match = url.trim().match(pattern);
    if (match?.[1]) return match[1];
  }
  try {
    const v = new URL(url.trim()).searchParams.get("v");
    if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;
  } catch {
    // URL inválida
  }
  return null;
}

export function youtubeThumbnail(url: string): string {
  const id = extractYouTubeId(url);
  return id
    ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
    : "https://dummyimage.com/320x180/e5e7eb/6b7280&text=No+Thumbnail";
}

export function youtubeEmbedUrl(url: string): string | null {
  const id = extractYouTubeId(url);
  return id ? `https://www.youtube.com/embed/${id}` : null;
}
