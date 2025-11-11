/**
 * Client-side encryption utilities using Web Crypto API
 * Implements AES-GCM encryption for zero-knowledge architecture
 */

/**
 * Generate a random encryption key
 */
export async function generateKey(): Promise<CryptoKey> {
  return await crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true, // extractable
    ['encrypt', 'decrypt']
  );
}

/**
 * Generate a random IV (Initialization Vector)
 */
export function generateIV(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(12));
}

/**
 * Encrypt data using AES-GCM
 */
export async function encryptData(
  data: Uint8Array,
  key: CryptoKey,
  iv: Uint8Array
): Promise<Uint8Array> {
  const encryptedData = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    data
  );

  return new Uint8Array(encryptedData);
}

/**
 * Decrypt data using AES-GCM
 */
export async function decryptData(
  encryptedData: Uint8Array,
  key: CryptoKey,
  iv: Uint8Array
): Promise<Uint8Array> {
  const decryptedData = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    encryptedData
  );

  return new Uint8Array(decryptedData);
}

/**
 * Export a CryptoKey to raw format
 */
export async function exportKey(key: CryptoKey): Promise<Uint8Array> {
  const exported = await crypto.subtle.exportKey('raw', key);
  return new Uint8Array(exported);
}

/**
 * Import a key from raw format
 */
export async function importKey(keyData: Uint8Array): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
    'raw',
    keyData,
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt a file client-side
 * Returns encrypted data, IV, and key
 */
export async function encryptFile(fileData: Uint8Array): Promise<{
  encryptedData: Uint8Array;
  iv: Uint8Array;
  key: Uint8Array;
}> {
  const key = await generateKey();
  const iv = generateIV();
  const encryptedData = await encryptData(fileData, key, iv);
  const exportedKey = await exportKey(key);

  return {
    encryptedData,
    iv,
    key: exportedKey,
  };
}

/**
 * Decrypt a file client-side
 */
export async function decryptFile(
  encryptedData: Uint8Array,
  keyData: Uint8Array,
  iv: Uint8Array
): Promise<Uint8Array> {
  const key = await importKey(keyData);
  return await decryptData(encryptedData, key, iv);
}

/**
 * Encrypt text using AES-GCM
 */
export async function encryptText(text: string): Promise<{
  encryptedText: string;
  iv: string;
  key: string;
}> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);

  const key = await generateKey();
  const iv = generateIV();
  const encryptedData = await encryptData(data, key, iv);
  const exportedKey = await exportKey(key);

  return {
    encryptedText: Buffer.from(encryptedData).toString('base64'),
    iv: Buffer.from(iv).toString('base64'),
    key: Buffer.from(exportedKey).toString('base64'),
  };
}

/**
 * Decrypt text using AES-GCM
 */
export async function decryptText(
  encryptedText: string,
  keyData: string,
  ivData: string
): Promise<string> {
  const encryptedBytes = new Uint8Array(
    Buffer.from(encryptedText, 'base64')
  );
  const key = await importKey(
    new Uint8Array(Buffer.from(keyData, 'base64'))
  );
  const iv = new Uint8Array(Buffer.from(ivData, 'base64'));

  const decryptedData = await decryptData(encryptedBytes, key, iv);
  const decoder = new TextDecoder();
  return decoder.decode(decryptedData);
}

/**
 * Hash data using SHA-256 (for integrity checks)
 */
export async function hashData(data: Uint8Array): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate a secure random string (for tokens, IDs, etc.)
 */
export function generateRandomString(length: number = 32): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .substring(0, length);
}
