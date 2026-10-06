// Certificate codes: IMB-XXXX-XXXX-XXXX, 60 bits taken from HMAC-SHA256(JWT_SECRET, user|track).
// Deterministic (re-issuing yields the same code) yet unguessable without the secret.

// Crockford-style alphabet without the look-alikes I, O, 0 and 1.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export const CERTIFICATE_CODE_RE = /^IMB-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/;

export async function certificateCode(secret: string, userId: string, track: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  // JSON framing keeps ("a|b", "c") and ("a", "b|c") distinct; the label separates this use of the key.
  const msg = JSON.stringify(["imbegnal:certificate:v1", userId, track]);
  const mac = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(msg)));
  let bits = 0;
  let acc = 0;
  let out = "";
  for (const byte of mac) {
    acc = (acc << 8) | byte;
    bits += 8;
    while (bits >= 5 && out.length < 12) {
      out += ALPHABET[(acc >> (bits - 5)) & 31];
      bits -= 5;
    }
    acc &= (1 << bits) - 1;
    if (out.length === 12) break;
  }
  return `IMB-${out.slice(0, 4)}-${out.slice(4, 8)}-${out.slice(8, 12)}`;
}

/** Upper-cases and validates user input; null when it cannot be a certificate code. */
export function normalizeCertificateCode(input: string): string | null {
  const code = input.trim().toUpperCase();
  return CERTIFICATE_CODE_RE.test(code) ? code : null;
}
