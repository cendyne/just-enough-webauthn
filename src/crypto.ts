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

export type SupportedPublicKey = PublicKeyES256 | PublicKeyRS256;
export type SupportedAlgorithm = 'ES256' | 'RS256';

export async function importKey(jwk: JsonWebKey): Promise<CryptoKey> {
  if (jwk.alg === 'ES256') {
    return crypto.subtle.importKey(
      'jwk',
      jwk,
      {
        name: 'ECDSA',
        namedCurve: 'P-256',
      },
      true,
      ['verify']
    );
  } else if (jwk.alg === 'RS256') {
    return crypto.subtle.importKey(
      'jwk',
      jwk,
      {
        name: 'RSASSA-PKCS1-v1_5',
        hash: {name: 'SHA-256'},
      },
      true,
      ['verify']
    );
  }
  throw new Error('Unsupported public key');
}
