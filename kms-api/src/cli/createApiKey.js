import { randomBytes } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import { hashApiKeyForStorage } from '../middleware/auth.js';
import { insertApiKey } from '../db/index.js';

dotenv.config();

function generateToken() {
  return randomBytes(24).toString('base64url');
}

const id = uuidv4();
const token = generateToken();
const name = process.argv[2] || null;
const hash = hashApiKeyForStorage(token);
const createdAt = new Date().toISOString();

insertApiKey({ id, name, hash, createdAt });

console.log('API Key created');
console.log('ID:', id);
if (name) console.log('Name:', name);
console.log('Token (save this now, it will NOT be shown again):');
console.log(token);

