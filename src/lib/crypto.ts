// Simple client-side password hashing utilities
// We hash the plaintext password with SHA-256 before sending to server
// Server will still hash again with bcrypt, resulting in bcrypt(SHA256(password))

/**
 * Compute SHA-256 digest of the given input and return a lowercase hex string.
 */
export async function sha256Hex(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  const bytes = new Uint8Array(digest);
  let hex = '';
  for (let i = 0; i < bytes.length; i += 1) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}


