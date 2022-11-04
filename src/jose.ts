import {SupportedPublicKey} from './crypto';
import {encodeBase64Url} from './util';

export function encodeJWK(key: SupportedPublicKey): JsonWebKey {
  if (key.algorithm === 'ES256') {
    return {
      kty: 'EC',
      alg: 'ES256',
      crv: 'P-256',
      use: 'sig',
      x: encodeBase64Url(key.x),
      y: encodeBase64Url(key.y),
      key_ops: ["verify"],
      ext: true,
    };
  } else if (key.algorithm === 'RS256') {
    return {
      kty: 'RSA',
      alg: 'RS256',
      use: 'sig',
      n: encodeBase64Url(key.n),
      e: encodeBase64Url(key.e),
      key_ops: ["verify"],
      ext: true,
    };
  }
  throw new Error('Unsupported public key');
}
