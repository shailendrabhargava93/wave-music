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
  