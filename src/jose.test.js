import { describe, it, expect } from 'vitest'
import {encodeJWK} from './jose'
import { decodeBase64Url } from './util';
import {PublicES256, PublicRS256} from './common.test'

describe('JWK Encode', ()=> {
  it('Can encode ECDSA P-256 keys', () => {
    expect(encodeJWK({
      algorithm: "ES256",
      x: decodeBase64Url(PublicES256.x),
      y: decodeBase64Url(PublicES256.y)
    })).toStrictEqual({
      ...PublicES256,
      use: 'sig',
    })
  });
  it('Can encode RSA 2048 keys', () => {
    expect(encodeJWK({
      algorithm: "RS256",
      e: decodeBase64Url(PublicRS256.e),
      n: decodeBase64Url(PublicRS256.n)
    })).toStrictEqual({
      ...PublicRS256,
      use: 'sig',
    })
  });
  it('Rejects unknown algorithms', () => {
    expect(() => {encodeJWK({algorithm: 'taco'})}).toThrow(Error);
  })
});