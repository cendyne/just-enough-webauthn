import { describe, it, expect } from 'vitest'
import { decodeBase64, decodeBase64Url, decodeHex } from '../util';
import {decodeWebAuthnAuthData, decodeWebAuthnRegister} from './registration'
describe('Decode Registration Auth data', () => {
  it('Decodes registration', () => {
    let authData = decodeBase64('5Xzy8T0lOI+lGCNxUj1Gkv4afX8pd2CguvM0wW24Z31BAAAAAi/AV5+BE0fqsRa7Wo25ICoAQPPTdIWWy5rxtPl7kMlvDhCnyedMAL1MnIb6Dr4X8LxYxxPPf1ePUCDkcaeTkDumNZe8QygXVYURVjC2C0Ms0I6lAQIDJiABIVgg7A8cNQWoU35zXxfQTE5VUTnG6ivmvGXP5guCyjRtX4MiWCCGwl6Xa+GjdAd9GIIIEAIfw0jDtNfET+V6HUUIU1LRYg==');
    let registration = decodeWebAuthnAuthData(authData);
    expect(registration).toStrictEqual({
      rpIdHash: decodeBase64('5Xzy8T0lOI+lGCNxUj1Gkv4afX8pd2CguvM0wW24Z30='),
      flags: {
        userPresent: true,
        userVerified: false,
        backupEligibility: false,
        backupState: false,
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
    expect(() => {decodeWebAuthnAuthData(authData)}).toThrow(Error);
  });
  it('Rejects non maps', () => {
    let authData = decodeBase64('5Xzy8T0lOI+lGCNxUj1Gkv4afX8pd2CguvM0wW24Z31BAAAAAi/AV5+BE0fqsRa7Wo25ICoAQPPTdIWWy5rxtPl7kMlvDhCnyedMAL1MnIb6Dr4X8LxYxxPPf1ePUCDkcaeTkDumNZe8QygXVYURVjC2C0Ms0I4B');
    expect(() => {decodeWebAuthnAuthData(authData)}).toThrow(Error);
  })
  it('Technically can parse without attested data', () => {
    let authData = decodeHex('e57cf2f13d25388fa5182371523d4692fe1a7d7f297760a0baf334c16db8677d0100000002'.replaceAll(' ', ''))
    let registration = decodeWebAuthnAuthData(authData);
    expect(registration).toStrictEqual({
      rpIdHash: decodeBase64('5Xzy8T0lOI+lGCNxUj1Gkv4afX8pd2CguvM0wW24Z30='),
      flags: {
        userPresent: true,
        userVerified: false,
        backupEligibility: false,
        backupState: false,
        attestedCredentialDataIncluded: false,
        extensionDataIncluded: false
      },
      signCounter: 2
    })
  })
  it('Technically can parse extensions', () => {
    let authData = decodeBase64('5Xzy8T0lOI+lGCNxUj1Gkv4afX8pd2CguvM0wW24Z32BAAAAAqEAAQ==')
    let registration = decodeWebAuthnAuthData(authData);
    expect(registration).toStrictEqual({
      rpIdHash: decodeBase64('5Xzy8T0lOI+lGCNxUj1Gkv4afX8pd2CguvM0wW24Z30='),
      flags: {
        userPresent: true,
        userVerified: false,
        backupEligibility: false,
        backupState: false,
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
      decodeWebAuthnAuthData(authData);
    }).toThrow(Error);
  })
  it('Rejects extensions that are not maps', () => {
    let authData = decodeBase64('5Xzy8T0lOI+lGCNxUj1Gkv4afX8pd2CguvM0wW24Z32BAAAAAgE=')
    expect(() => {
      decodeWebAuthnAuthData(authData);
    }).toThrow(Error);
  })
  it('Rejects backup states that are not legal', () => {
    let authData = decodeHex('E57CF2F1 3D25388F A5182371 523D4692 FE1A7D7F 297760A0 BAF334C1 6DB8677D 11000000 02')
    expect(() => {
      decodeWebAuthnAuthData(authData);
    }).toThrow(Error);
  })
});
describe('Decode Authn Register', () => {
  it('Should accept a yubikey registration', () => {
    const sig = decodeBase64Url('MEUCIQDMfXB9LKdzTSF_dnAuLmXK0gozW-ngICb1bb7WE3KKLwIgZQhmoNYG6Rz4FobEwjmsOYxrU9_B63w4cP8czy_ST0g');
    const rpIdHash = decodeHex('e57cf2f13d25388fa5182371523d4692fe1a7d7f297760a0baf334c16db8677d');
    const credentialId = decodeBase64Url('Vqr25hfTp01xF9n-J-pdy3YMrQ9yEbKoMs75lJRfiFcWCtxtXtXkr0LXq2h3Kr9XqC-kMGx-GZAtdR9pRgSLzA');
    const registerData = decodeBase64Url('o2NmbXRmcGFja2VkZ2F0dFN0bXSjY2FsZyZjc2lnWEcwRQIhAMx9cH0sp3NNIX92cC4uZcrSCjNb6eAgJvVtvtYTcoovAiBlCGag1gbpHPgWhsTCOaw5jGtT38HrfDhw_xzPL9JPSGN4NWOBWQLBMIICvTCCAaWgAwIBAgIEHo-HNDANBgkqhkiG9w0BAQsFADAuMSwwKgYDVQQDEyNZdWJpY28gVTJGIFJvb3QgQ0EgU2VyaWFsIDQ1NzIwMDYzMTAgFw0xNDA4MDEwMDAwMDBaGA8yMDUwMDkwNDAwMDAwMFowbjELMAkGA1UEBhMCU0UxEjAQBgNVBAoMCVl1YmljbyBBQjEiMCAGA1UECwwZQXV0aGVudGljYXRvciBBdHRlc3RhdGlvbjEnMCUGA1UEAwweWXViaWNvIFUyRiBFRSBTZXJpYWwgNTEyNzIyNzQwMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEqHn4IzjtFJS6wHBLzH_GY9GycXFZdiQxAcdgURXXwVKeKBwcZzItOEtc1V3T6YGNX9hcIq8ybgxk_CCv4z8jZqNsMGowIgYJKwYBBAGCxAoCBBUxLjMuNi4xLjQuMS40MTQ4Mi4xLjcwEwYLKwYBBAGC5RwCAQEEBAMCBDAwIQYLKwYBBAGC5RwBAQQEEgQQL8BXn4ETR-qxFrtajbkgKjAMBgNVHRMBAf8EAjAAMA0GCSqGSIb3DQEBCwUAA4IBAQCGk_9i3w1XedR0jX_I0QInMYqOWA5qOlfBCOlOA8OFaLNmiU_OViS-Sj79fzQRiz2ZN0P3kqGYkWDI_JrgsE49-e4V4-iMBPyCqNy_WBjhCNzCloV3rnn_ZiuUc0497EWXMF1z5uVe4r65zZZ4ygk15TPrY4-OJvq7gXzaRB--mDGDKuX24q2ZL56720xiI4uPjXq0gdbTJjvNv55KV1UDcJiK1YE0QPoDLK22cjyt2PjXuoCfdbQ8_6Clua3RQjLvnZ4UgSY4IzxMpKhzufismOMroZFnYG4VkJ_N20ot_72uRiAkn5pmRqyB5IMtERn-v6pzGogtolp3gn1G0ZAXaGF1dGhEYXRhWMTlfPLxPSU4j6UYI3FSPUaS_hp9fyl3YKC68zTBbbhnfUEAAAABL8BXn4ETR-qxFrtajbkgKgBAVqr25hfTp01xF9n-J-pdy3YMrQ9yEbKoMs75lJRfiFcWCtxtXtXkr0LXq2h3Kr9XqC-kMGx-GZAtdR9pRgSLzKUBAgMmIAEhWCB52god9W3uViHIyJo3OjwmfGdGCh6q2X60mo8q8nIyUyJYIC2y4HWHNGHKrluGK_FcYK-DuWRw8xsGNVIZoBy1MlK5');
    let result = decodeWebAuthnRegister(registerData);
    expect(result.authData).toStrictEqual({
      attestedCredentialData: {
        aaguid: decodeHex('2fc0579f811347eab116bb5a8db9202a'),
        credentialId,
        credential: {
          algorithm: 'ES256',
          x: decodeBase64Url('edoKHfVt7lYhyMiaNzo8JnxnRgoeqtl-tJqPKvJyMlM'),
          y: decodeBase64Url('LbLgdYc0YcquW4Yr8Vxgr4O5ZHDzGwY1UhmgHLUyUrk')
        }
      },
      flags: {
        userPresent: true,
        userVerified: false,
        backupEligibility: false,
        backupState: false,
        attestedCredentialDataIncluded: true,
        extensionDataIncluded: false
      },
      rpIdHash,
      signCounter: 1
    })
    expect(result.credentialId).toStrictEqual(credentialId);
    expect(result.publicKey).toStrictEqual({
      kty: "EC",
      alg: "ES256",
      crv: "P-256",
      use: "sig",
      x: "edoKHfVt7lYhyMiaNzo8JnxnRgoeqtl-tJqPKvJyMlM",
      y: "LbLgdYc0YcquW4Yr8Vxgr4O5ZHDzGwY1UhmgHLUyUrk",
      key_ops: ["verify"],
      ext: true
    })
    expect(result.signature).toStrictEqual({
      format: 'packed',
      alg: -7,
      sig,
      x5c: [decodeBase64Url('MIICvTCCAaWgAwIBAgIEHo-HNDANBgkqhkiG9w0BAQsFADAuMSwwKgYDVQQDEyNZdWJpY28gVTJGIFJvb3QgQ0EgU2VyaWFsIDQ1NzIwMDYzMTAgFw0xNDA4MDEwMDAwMDBaGA8yMDUwMDkwNDAwMDAwMFowbjELMAkGA1UEBhMCU0UxEjAQBgNVBAoMCVl1YmljbyBBQjEiMCAGA1UECwwZQXV0aGVudGljYXRvciBBdHRlc3RhdGlvbjEnMCUGA1UEAwweWXViaWNvIFUyRiBFRSBTZXJpYWwgNTEyNzIyNzQwMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEqHn4IzjtFJS6wHBLzH_GY9GycXFZdiQxAcdgURXXwVKeKBwcZzItOEtc1V3T6YGNX9hcIq8ybgxk_CCv4z8jZqNsMGowIgYJKwYBBAGCxAoCBBUxLjMuNi4xLjQuMS40MTQ4Mi4xLjcwEwYLKwYBBAGC5RwCAQEEBAMCBDAwIQYLKwYBBAGC5RwBAQQEEgQQL8BXn4ETR-qxFrtajbkgKjAMBgNVHRMBAf8EAjAAMA0GCSqGSIb3DQEBCwUAA4IBAQCGk_9i3w1XedR0jX_I0QInMYqOWA5qOlfBCOlOA8OFaLNmiU_OViS-Sj79fzQRiz2ZN0P3kqGYkWDI_JrgsE49-e4V4-iMBPyCqNy_WBjhCNzCloV3rnn_ZiuUc0497EWXMF1z5uVe4r65zZZ4ygk15TPrY4-OJvq7gXzaRB--mDGDKuX24q2ZL56720xiI4uPjXq0gdbTJjvNv55KV1UDcJiK1YE0QPoDLK22cjyt2PjXuoCfdbQ8_6Clua3RQjLvnZ4UgSY4IzxMpKhzufismOMroZFnYG4VkJ_N20ot_72uRiAkn5pmRqyB5IMtERn-v6pzGogtolp3gn1G0ZAX')]
    })
  });
  it('Should reject bad data', () => {
    expect(()=>{
      decodeWebAuthnRegister()
    }).toThrow(Error);
    expect(()=>{
      // ain't nothin
      decodeWebAuthnRegister(new Uint8Array([]))
    }).toThrow(Error);
    expect(()=>{
      // Just a number, actually cbor but not a map so it cannot be decoded
      decodeWebAuthnRegister(decodeHex('00'))
    }).toThrow(Error);
    expect(()=>{
      // format not supported
      decodeWebAuthnRegister(decodeHex('a163 666d 7464 7465 7374'))
    }).toThrow(Error);
    expect(()=>{
      // packed attStmt is not a map
      decodeWebAuthnRegister(decodeHex('a263 666d 7466 7061 636b 6564 6761 7474 5374 6d74 03'))
    }).toThrow(Error);
    expect(()=>{
      // packed alg not supported
      decodeWebAuthnRegister(decodeHex('a263 666d 7466 7061 636b 6564 6761 7474 5374 6d74 a163 616c 6700'))
    }).toThrow(Error);
    expect(()=>{
      // packed alg not supported
      decodeWebAuthnRegister(decodeHex('a263 666d 7466 7061 636b 6564 6761 7474 5374 6d74 a163 616c 6700'))
    }).toThrow(Error);
    expect(()=>{
      // packed sig is not a byte string
      decodeWebAuthnRegister(decodeHex('a263 666d 7466 7061 636b 6564 6761 7474 5374 6d74 a263 616c 6726 6373 6967 6268 69'))
    }).toThrow(Error);
    expect(()=>{
      // packed sig is not a byte string
      decodeWebAuthnRegister(decodeHex('a263 666d 7466 7061 636b 6564 6761 7474 5374 6d74 a263 616c 6726 6373 6967 6268 69'))
    }).toThrow(Error);
    expect(() => {
      // authData is the wrong type
      decodeWebAuthnRegister(decodeHex('a363666d74667061636b65646761747453746d74a263616c67266373696744deadbeef6861757468446174616568656c6c6f'))
    }).toThrow(Error)
    expect(() => {
      // authData has the right type but lacks attested credential
      decodeWebAuthnRegister(decodeHex('a363666d74667061636b65646761747453746d74a263616c67266373696744deadbeef6861757468446174615825e57cf2f13d25388fa5182371523d4692fe1a7d7f297760a0baf334c16db8677d0100000002'))
    }).toThrow(Error)
    expect(() => {
      // x5c is the wrong type
      decodeWebAuthnRegister(decodeHex('a263666d74667061636b65646761747453746d74a363616c67266373696744deadbeef6378356301'))
    }).toThrow(Error)
    expect(() => {
      // x5c child is the wrong type
      decodeWebAuthnRegister(decodeHex('a263666d74667061636b65646761747453746d74a363616c67266373696744deadbeef637835638101'))
    }).toThrow(Error)
  });
  it('None is not supported yet', () => {
    expect(() => {
      decodeWebAuthnRegister(decodeHex('a163 666d 7464 6e6f 6e65'))
    }).toThrow(Error);
  });
});