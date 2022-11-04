import { describe, it, expect } from 'vitest'
import {decodePublicKey, supportedJoseAlgorithmToCoseAlgorithm, isCoseAlgorithmSupported} from './cose'
import { decodeBase64Url, decodeHex } from './util';
import { decodeCBOR } from './cbor'

describe('COSE Key Decoding', () => {
  it('Decodes ES256 properly', () => {
    expect(decodePublicKey(new Map([
      [1, 2], // kty Label 1 - EC2 (2)
      [3, -7], // alg label 3 - ES256 (-7)
      [-1, 1], // crv label -1 - P-256 (1)
      [-2, decodeHex('ec0f1c3505a8537e735f17d04c4e555139c6ea2be6bc65cfe60b82ca346d5f83')], // x label -2
      [-3, decodeHex('86c25e976be1a374077d18820810021fc348c3b4d7c44fe57a1d45085352d162')] // y label -3
    ]))).toStrictEqual({
      algorithm: 'ES256',
      x: decodeHex('ec0f1c3505a8537e735f17d04c4e555139c6ea2be6bc65cfe60b82ca346d5f83'),
      y: decodeHex('86c25e976be1a374077d18820810021fc348c3b4d7c44fe57a1d45085352d162')
    });
  })
  it('Decodes RS256 properly', () => {
    // Comes from google ee1b9f88cfe3151ddd284a61bf8cecf659b130cf
    // https://www.googleapis.com/oauth2/v3/certs
    const n_b64 = 'rTOxVQCdPMM6n3XRW7VW5e8bGCoimxT-m4cUyaTtLCIf1IqFJRhzc3rgdxsdpg5fjj1Ln2yG_r-3FbkFYJw1ebOCwJ_xlrIeL7FZWqKHl2u5tPKhYkBpPsh-SFZrlEv6X6W2tLcXaFs_8qeHbEasW3A7S6SiS6vMLvcEgufvHSHM1W61U6R9wzOo0lr3rBBOahZFr2Vym8P3eZZ9u_i07RFEqUEFhHXnHYHMLY2Ch9-JbZlCRVbBOfTxCPdOqOkZyFQfGOMj5XLbPHXLSBlmsNzFSv3KgPhZgvmfK113VUN3RFgnDZ5q_-4FK82j_L0FrYZUPRGBA9Crlvtxg_LJWQ'
    expect(decodePublicKey(new Map([
      [1, 3], // kty Label 1 - RSA (3)
      [3, -257], // alg label 3 - RS256 (-257)
      [-1, decodeBase64Url(n_b64)], // n label -1
      [-2, decodeBase64Url('AQAB')] // e label -2
    ]))).toStrictEqual({
      algorithm: 'RS256',
      n: decodeBase64Url(n_b64),
      e: decodeBase64Url('AQAB')
    });
  })
  it('Rejects maps that do not match', () => {
    expect(() => {decodePublicKey(new Map([]))}).toThrow(Error);
  });
  it('COSE RS256 Keys decode as expected', () => {
    // Comes from https://github.com/Yubico/python-fido2/blob/667ff5588b845ee1891d44ef0e92e607aa5509d5/tests/test_cose.py
    const rs256 = decodeBase64Url('pAEDAzkBACBZAQC2ENzoS2UCn64k97-KFzDTe8kUNWQqYo5pHpsDC_P3zsWf-Ry-gsVN4WwTb6T6iliTm1qVCzLgMHNZL-yNizNgHAT3Dl4tXPe06AXhmQ6lqGkoobOQ65AmUnkzrMA-bkHcC-QKpet7m0YHQ-TdgIladY-z8_eU5em4MQ06YMKPJBDZXPbnMnSaJDowR1JnYotFbedwvCGFu-0dRR7LAGKj0TLA5NhC4N35OkRKPuM6hcLpExVjYXExVfHx3GTo5o7RdkZlU7veZp64KBCxBMtEB9Mq5jFsO9bzguw64sX9STBJhtZNku0RwltsXPEocjNUWph-mj4Wn5l5BgPbpcitIUMBAAE');
    let decoded = decodeCBOR(rs256);
    const n = decodeBase64Url('thDc6EtlAp-uJPe_ihcw03vJFDVkKmKOaR6bAwvz987Fn_kcvoLFTeFsE2-k-opYk5talQsy4DBzWS_sjYszYBwE9w5eLVz3tOgF4ZkOpahpKKGzkOuQJlJ5M6zAPm5B3AvkCqXre5tGB0Pk3YCJWnWPs_P3lOXpuDENOmDCjyQQ2Vz25zJ0miQ6MEdSZ2KLRW3ncLwhhbvtHUUeywBio9EywOTYQuDd-TpESj7jOoXC6RMVY2FxMVXx8dxk6OaO0XZGZVO73maeuCgQsQTLRAfTKuYxbDvW84LsOuLF_UkwSYbWTZLtEcJbbFzxKHIzVFqYfpo-Fp-ZeQYD26XIrQ');
    const e = decodeBase64Url('AQAB');
    // Ensure that the encoded form (from elsewhere) decodes as expected
    // prior to input into the cose decode function
    expect(decoded).toStrictEqual(new Map([
      [1, 3], // kty Label 1 - RSA (3)
      [3, -257], // alg label 3 - RS256 (-257)
      [-1, n], // n label -1
      [-2, e] // e label -2
    ]));
    // Now that the encoded form is verified, make sure it parses correctly
    expect(decodePublicKey(decoded)).toStrictEqual({
      algorithm: 'RS256',
      n,
      e
    });
  });
  it('COSE ES256 Keys decode as expected', () => {
    // Comes from https://github.com/Yubico/python-fido2/blob/667ff5588b845ee1891d44ef0e92e607aa5509d5/tests/test_cose.py
    const es256 = decodeBase64Url('pQECAyYgASFYIKX9XOGxxFjFMKVPphsxv2sEvouXr95U3Yy7aSdaihvhIlgg-joyMd2d7tnRiXvlpiKMWVAeS80Sl109_3MPASeOphw');
    let decoded = decodeCBOR(es256);
    const x = decodeBase64Url('pf1c4bHEWMUwpU-mGzG_awS-i5ev3lTdjLtpJ1qKG-E');
    const y = decodeBase64Url('-joyMd2d7tnRiXvlpiKMWVAeS80Sl109_3MPASeOphw');
    // Ensure that the encoded form (from elsewhere) decodes as expected
    // prior to input into the cose decode function
    expect(decoded).toStrictEqual(new Map([
      [1, 2], // kty Label 1 - EC2 (2)
      [3, -7], // alg label 3 - ES256 (-7)
      [-1, 1], // crv label -1 - P-256 (1)
      [-2, x], // x label -2
      [-3, y] // y label -3
    ]));
    // Now that the encoded form is verified, make sure it parses correctly
    expect(decodePublicKey(decoded)).toStrictEqual({
      algorithm: 'ES256',
      x,
      y
    });
  });
});
describe('Supported COSE Algorithms', () => {
  it('Should only accept supported numbers', () => {
    expect(isCoseAlgorithmSupported(-7)).toBe(true);
    expect(isCoseAlgorithmSupported(-257)).toBe(true);
  })
  it('Should only reject unsupported numbers', () => {
    expect(isCoseAlgorithmSupported(-5)).toBe(false);
    expect(isCoseAlgorithmSupported(256)).toBe(false);
  })
  it('Should translate COSE algorithms to JOSE Algorithms', () => {
    expect(supportedJoseAlgorithmToCoseAlgorithm('ES256')).toBe(-7);
    expect(supportedJoseAlgorithmToCoseAlgorithm('RS256')).toBe(-257);
  })
});