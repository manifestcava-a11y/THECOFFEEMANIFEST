const normalizeWeightString = (value: string): string => {
  return value
    .toLowerCase()
    .replace(/[‐‑‒–—―]/g, ' ')
    .replace(/\u00a0/g, ' ')
    .replace(/килограмм(ы)?|кілогр?ам(и|ів)?|кг\.?/g, 'kg')
    .replace(/грам(и|ів|мів|м)?|гр\.?|г\b/g, 'g')
    .replace(/,/g, '.')
    .replace(/\s+/g, ' ')
    .trim();
};

export function getWeightString(
  input: number | string | null | undefined,
  defaultValue: string = ''
): string {
  if (input == null) {
    return defaultValue;
  }

  if (typeof input === 'number') {
    const grams = Math.round(input);
    if (Number.isNaN(grams) || grams <= 0) {
      return defaultValue;
    }
    return `${grams} г`;
  }

  const raw = String(input).trim();
  if (!raw) {
    return defaultValue;
  }

  const normalized = normalizeWeightString(raw);
  if (!normalized) {
    return defaultValue;
  }

  const kgMatch = normalized.match(/(\d+(?:\.\d+)?)\s*kg/);
  if (kgMatch) {
    const kg = parseFloat(kgMatch[1]);
    if (!Number.isNaN(kg)) {
      return `${Math.round(kg * 1000)} г`;
    }
  }

  const gMatch = normalized.match(/(\d+(?:\.\d+)?)\s*g\b/);
  if (gMatch) {
    const grams = parseFloat(gMatch[1]);
    if (!Number.isNaN(grams)) {
      return `${Math.round(grams)} г`;
    }
  }

  const numberMatch = normalized.match(/(\d+(?:\.\d+)?)/);
  if (numberMatch) {
    const value = parseFloat(numberMatch[1]);
    if (!Number.isNaN(value)) {
      if (normalized.includes('kg') || (value <= 5 && normalized.includes('0.'))) {
        return `${Math.round(value * 1000)} г`;
      }
      if (value >= 10) {
        return `${Math.round(value)} г`;
      }
    }
  }

  if (/^\d+$/.test(raw)) {
    return `${raw} г`;
  }

  return defaultValue;
}

export function getWeightDescriptor(label: string | null | undefined, baseWeight: string): string {
  if (!label) {
    return '';
  }

  const cleaned = label
    .replace(/\d+(?:[.,]\d+)?\s*(kg|g|кг|г|гр)\b/gi, '')
    .replace(/[()[\]]/g, ' ')
    .replace(/[‐‑‒–—―\-_/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) {
    return '';
  }

  if (baseWeight && cleaned.toLowerCase() === baseWeight.toLowerCase()) {
    return '';
  }

  return cleaned;
}






