import { describe, it, expect } from 'vitest'
import { decodeBase64, decodeHex } from './util';
import {decodeWebAuthnRegistration} from './webauthn'
describe('Decode Registration data', () => {
  it('Decodes registration', () => {
    let authData = decodeBase64('5Xzy8T0lOI+lGCNxUj1Gkv4afX8pd2CguvM0wW24Z31BAAAAAi/AV5+BE0fqsRa7Wo25ICoAQPPTdIWWy5rxtPl7kMlvDhCnyedMAL1MnIb6Dr4X8LxYxxPPf1ePUCDkcaeTkDumNZe8QygXVYURVjC2C0Ms0I6lAQIDJiABIVgg7A8cNQWoU35zXxfQTE5VUTnG6ivmvGXP5guCyjRtX4MiWCCGwl6Xa+GjdAd9GIIIEAIfw0jDtNfET+V6HUUIU1LRYg==');
    let registration = decodeWebAuthnRegistration(authData);
    expect(registration).toStrictEqual({
      rpIdHash: decodeBase64('5Xzy8T0lOI+lGCNxUj1Gkv4afX8pd2CguvM0wW24Z30='),
      flags: {
        userPresent: true,
        userVerified: false,
        attestedCredentialDataIncluded: true,
        extensionDataIncluded: false
      },
      signCounter: 2,
      attestedCredentialData: {
        aaguid: decodeBase64('L8BXn4ETR+qxFrtajbkgKg=='),
        credential: {
          algorithm: 'ES256',
          x: decodeBase64('7A8cNQWoU35zXxfQTE5VUTnG6ivmvGXP5guCyjRtX4M='),
          y: decodeBase64('hsJel2vho3QHfRiCCBACH8NIw7TXxE/leh1FCFNS0WI=')
        },
        credentialId: decodeBase64('89N0hZbLmvG0+XuQyW8OEKfJ50wAvUychvoOvhfwvFjHE89/V49QIORxp5OQO6Y1l7xDKBdVhRFWMLYLQyzQjg==')
      }
    })
  });
  it('Rejects extra data', () => {
    let authData = decodeBase64('5Xzy8T0lOI+lGCNxUj1Gkv4afX8pd2CguvM0wW24Z31BAAAAAi/AV5+BE0fqsRa7Wo25ICoAQPPTdIWWy5rxtPl7kMlvDhCnyedMAL1MnIb6Dr4X8LxYxxPPf1ePUCDkcaeTkDumNZe8QygXVYURVjC2C0Ms0I6lAQIDJiABIVgg7A8cNQWoU35zXxfQTE5VUTnG6ivmvGXP5guCyjRtX4MiWCCGwl6Xa+GjdAd9GIIIEAIfw0jDtNfET+V6HUUIU1LRYgAA');
    expect(() => {decodeWebAuthnRegistration(authData)}).toThrow(Error);
  });
  it('Rejects non maps', () => {
    let authData = decodeBase64('5Xzy8T0lOI+lGCNxUj1Gkv4afX8pd2CguvM0wW24Z31BAAAAAi/AV5+BE0fqsRa7Wo25ICoAQPPTdIWWy5rxtPl7kMlvDhCnyedMAL1MnIb6Dr4X8LxYxxPPf1ePUCDkcaeTkDumNZe8QygXVYURVjC2C0Ms0I4B');
    expect(() => {decodeWebAuthnRegistration(authData)}).toThrow(Error);
  })
  it('Technically can parse without attested data', () => {
    let authData = decodeHex('e57cf2f13d25388fa5182371523d4692fe1a7d7f297760a0baf334c16db8677d0100000002'.replaceAll(' ', ''))
    let registration = decodeWebAuthnRegistration(authData);
    expect(registration).toStrictEqual({
      rpIdHash: decodeBase64('5Xzy8T0lOI+lGCNxUj1Gkv4afX8pd2CguvM0wW24Z30='),
      flags: {
        userPresent: true,
        userVerified: false,
        attestedCredentialDataIncluded: false,
        extensionDataIncluded: false
      },
      signCounter: 2
    })
  })
  it('Technically can parse extensions', () => {
    let authData = decodeBase64('5Xzy8T0lOI+lGCNxUj1Gkv4afX8pd2CguvM0wW24Z32BAAAAAqEAAQ==')
    let registration = decodeWebAuthnRegistration(authData);
    expect(registration).toStrictEqual({
      rpIdHash: decodeBase64('5Xzy8T0lOI+lGCNxUj1Gkv4afX8pd2CguvM0wW24Z30='),
      flags: {
        userPresent: true,
        userVerified: false,
        attestedCredentialDataIncluded: false,
        extensionDataIncluded: true
      },
      signCounter: 2,
      extensions: new Map([
        [0, 1]
      ])
    })
  })
  it('Rejects extensions that are not maps', () => {
    let authData = decodeBase64('5Xzy8T0lOI+lGCNxUj1Gkv4afX8pd2CguvM0wW24Z32BAAAAAgE=')
    expect(() => {
      decodeWebAuthnRegistration(authData);
    }).toThrow(Error);
  })
});