export function requireString(body, field, maxLen = 4096) {
  const v = body?.[field];
  if (typeof v !== 'string' || v.length === 0 || v.length > maxLen) {
    throw new Error(`Invalid field ${field}`);
  }
  return v;
}

export function requireBase64(body, field, maxLen = 8192) {
  const v = body?.[field];
  if (typeof v !== 'string' || v.length === 0 || v.length > maxLen) {
    throw new Error(`Invalid field ${field}`);
  }
  // Rough check
  if (!/^[A-Za-z0-9+/=]+$/.test(v)) {
    throw new Error(`Invalid base64 for ${field}`);
  }
  return v;
}
