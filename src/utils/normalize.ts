export const decodeHtmlEntities = (text: string): string => {
  if (!text) return text;
  try {
    // Use a temporary textarea to decode HTML entities
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  } catch (err) {
    return text;
  }
};

export const joinArtistNames = (artists?: { id?: string; name?: string }[]) =>
  (artists ?? [])
    .map(artist => artist?.name?.trim() ?? '')
    .filter(name => name)
    .join(', ');

export const joinArtistIds = (artists?: { id?: string; name?: string }[]) =>
  (artists ?? [])
    .map(artist => artist?.id?.trim() ?? '')
    .filter(id => id)
    .join(', ');

export const normalizeText = (text: string) =>
  (text || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s]/g, '')
    .trim();

export const normalizeArtist = (name: string) =>
  (name || '').toLowerCase().replace(/[^a-z0-9]/g, '');

export const similarityScore = (str1: string, str2: string): number => {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  if (longer.length === 0) return 1.0;

  const editDistance = (s1: string, s2: string): number => {
    const costs: number[] = [];
    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length];
  };
    return (longer.length - editDistance(longer, shorter)) / longer.length;
  };

export const formatCountShort = (n?: number | string): string => {
  if (n === undefined || n === null) return '';
  const num = typeof n === 'string' ? Number(n) : n;
  if (!Number.isFinite(num)) return String(n);
  const abs = Math.abs(num);
  if (abs >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}B`;
  if (abs >= 1_000_000) return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (abs >= 1_000) return `${(num / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(num);
};

// Returns a best-quality image URL from various shapes used by the API.
// Accepts: string URL, array of {quality,url}, object with url, or nested shapes.
export const getBestImage = (imgField: any): string => {
  if (!imgField) return '';
  // If it's already a string URL
  if (typeof imgField === 'string') return imgField;
  // If it's an array of images
  if (Array.isArray(imgField) && imgField.length > 0) {
    const prefer = ['500x500', '320x320', '150x150', '50x50'];
    for (const q of prefer) {
      const found = imgField.find((it: any) => (it?.quality === q) || (it?.url && it.url.includes(q)));
      if (found) return found.url || found.link || '';
    }
    // fallback to first available url
    const first = imgField.find((it: any) => it?.url) || imgField[0];
    return first?.url || first?.link || '';
  }
  // If it's an object with url
  if (typeof imgField === 'object') {
    if (imgField.url) return imgField.url;
    // Some shapes might use 'link' or nested arrays
    if (imgField.link) return imgField.link;
    // Try nested image arrays
    for (const key of ['images', 'image', 'thumbnail', 'cover']) {
      if (imgField[key]) return getBestImage(imgField[key]);
    }
  }
  return '';
};
