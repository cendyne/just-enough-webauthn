export interface PublicKeyES256 {
  algorithm: 'ES256';
  // kty: 2 // label: 1 - COSE Key Types - EC2
  // alg: -7 // label: 3 - COSE Algorithms - ES256
  // crv: 1 // label: -1 - COSE Elliptic Curves - P-256
  x: Uint8Array; // label: -2 - COSE Key Type Parameters - x
  y: Uint8Array; // label: -3 - COSE Key Type Parameters - y
}

export interface PublicKeyRS256 {
  algorithm: 'RS256';
  // kty: 3 // label: 1 - COSE Key Types - RSA
  // alg: -257 // label: 3 - COSE Algorithms - RS256
  n: Uint8Array; // label: -1 - COSE Key Type Parameters - n
  e: Uint8Array; // label: -2 - COSE Key Type Parameters - x
}

const UNSUPPORTED_COSE_KEY = 'COSE Public Key is not well formed or supported';

export function decodePublicKey(
  cborMap: Map<string | number, any>
): PublicKeyES256 | PublicKeyRS256 {
  const kty = cborMap.get(1);
  const alg = cborMap.get(3);
  if (kty === 2 && alg === -7) {
    const crv = cborMap.get(-1);
    if (crv === 1) {
      const x = cborMap.get(-2);
      const y = cborMap.get(-3);
      if (x instanceof Uint8Array && y instanceof Uint8Array) {
        return {
          algorithm: 'ES256',
          x,
          y,
        };
      }
    }
  } else if (kty === 3 && alg === -257) {
    const n = cborMap.get(-1);
    const e = cborMap.get(-2);
    if (n instanceof Uint8Array && e instanceof Uint8Array) {
      return {
        algorithm: 'RS256',
        n,
        e,
      };
    }
  }
  throw new Error(UNSUPPORTED_COSE_KEY);
}
