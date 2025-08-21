export class ApiError extends Error {
  constructor(status, message, code) {
    super(message);
    this.name = 'ApiError';
    this.status = status || 500;
    this.code = code || undefined;
  }
}

export function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  if (err instanceof ApiError) {
    return res.status(err.status).json({ error: err.message, code: err.code || undefined });
  }
  if (err && err.message && /Invalid field|Invalid base64/.test(err.message)) {
    return res.status(400).json({ error: err.message });
  }
  console.error(err);
  return res.status(500).json({ error: 'Internal Server Error' });
}
