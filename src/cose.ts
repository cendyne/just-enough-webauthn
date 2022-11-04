import {SupportedAlgorithm, SupportedPublicKey} from './crypto';

const UNSUPPORTED_COSE_KEY = 'COSE Public Key is not well formed or supported';

export function decodePublicKey(
  cborMap: Map<string | number, any>
): SupportedPublicKey {
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

export type SupportedCOSEAlgorithm = -7 | -257;

export function supportedJoseAlgorithmToCoseAlgorithm(
  alg: SupportedAlgorithm
): SupportedCOSEAlgorithm {
  switch (alg) {
    case 'ES256':
      return -7;
    case 'RS256':
      return -257;
  }
}

export function isCoseAlgorithmSupported(alg: number) : boolean {
  return alg === -7 || alg == -257;
}
