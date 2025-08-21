# KMS API

A stateless KMS-like API supporting AES-256-GCM encrypt/decrypt and HMAC-SHA256 sign/verify.

## Quickstart

1. Copy .env.example to .env and set secrets.
   - Set `MASTER_KEY_HEX` to a 64-hex-character value (32 bytes). Example: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
   - Optionally set `API_KEY_PEPPER`.
2. Install deps: `npm install`
3. Start dev server: `npm run dev`
4. Create an API key: `npm run create-key -- "my-key"`
5. Call endpoints with header: `Authorization: ApiKey <token>`

## Endpoints

- POST `/v1/keys` → create AES-256 key
  - body: `{ "name?": string }`
  - resp: `{ id, algorithm, name }`

- POST `/v1/encrypt`
  - body: `{ key_id, plaintext(base64), aad? }`
  - resp: `{ iv(base64), ciphertext(base64), tag(base64), algorithm }`

- POST `/v1/decrypt`
  - body: `{ key_id, iv(base64), ciphertext(base64), tag(base64), aad? }`
  - resp: `{ plaintext(base64) }`

- POST `/v1/sign`
  - body: `{ key_id, message(base64) }`
  - resp: `{ signature(base64), algorithm }`

- POST `/v1/verify`
  - body: `{ key_id, message(base64), signature(base64) }`
  - resp: `{ valid: boolean }`

## Notes

- Keys are wrapped at rest using a master key (HKDF→AES-256-GCM).
- API key auth via HMAC(SHA-256) with optional pepper; tokens stored hashed only.
- Uses SQLite (default). Change `DATABASE_URL` to a `sqlite:` URL.

