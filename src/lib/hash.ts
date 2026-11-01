/**
 * 32-bit FNV-1a synchronous hashing function.
 * Produces an 8-character lowercase hex string.
 * Pure, deterministic, zero dependencies.
 */
export function fnv1a(input: string): string {
  let hash = 0x811c9dc5; // FNV offset basis (2166136261)
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    // 32-bit integer multiplication by FNV prime 16777619
    hash = Math.imul(hash, 0x01000193);
  }
  // Convert to unsigned 32-bit integer and format as 8-char hex
  return (hash >>> 0).toString(16).padStart(8, "0");
}
