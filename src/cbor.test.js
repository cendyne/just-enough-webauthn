import { describe, it, expect } from 'vitest'
import {decodeCBOR, decodeLength, decodePartialCBOR} from './cbor'
import {decodeBase64, decodeHex} from './util'

describe('CBOR Decoding', () => {
  it('Decodes lengths properly', () => {
    expect(decodeLength(new Uint8Array([0x00]), 0, 0)).toStrictEqual([0, 1]);
    expect(decodeLength(new Uint8Array([0x0a]), 10, 0)).toStrictEqual([10, 1]);
    expect(decodeLength(new Uint8Array([0x18, 0x18]), 24, 0)).toStrictEqual([24, 2]);
    expect(decodeLength(new Uint8Array([0x18, 0x19]), 24, 0)).toStrictEqual([25, 2]);
    expect(decodeLength(new Uint8Array([0x19, 0x10, 0]), 25, 0)).toStrictEqual([4096, 3]);
  })
  it('Rejects improper lengths lengths properly', () => {
    expect(() => {decodeLength(new Uint8Array([0x18]), 24, 0)}).toThrow(Error);
    expect(() => {decodeLength(new Uint8Array([0x18, 0]), 24, 0)}).toThrow(Error);
    expect(() => {decodeLength(new Uint8Array([0x19]), 25, 0)}).toThrow(Error);
    expect(() => {decodeLength(new Uint8Array([0x19,0]), 25, 0)}).toThrow(Error);
    expect(() => {decodeLength(new Uint8Array([0x19,0,0]), 25, 0)}).toThrow(Error);
  })
  it('Rejects empty input', () => {
    expect(() => {decodeCBOR(new Uint8Array([]))}).toThrow(Error);
    expect(() => {decodePartialCBOR(new Uint8Array([]), -1)}).toThrow(Error);
    expect(() => {decodePartialCBOR(new Uint8Array([]), 1)}).toThrow(Error);
  })
  it('Can decode a single byte unsigned integer', () => {
    expect(decodeCBOR(new Uint8Array([0]))).toBe(0);
    expect(decodeCBOR(new Uint8Array([1]))).toBe(1);
    expect(decodeCBOR(new Uint8Array([23]))).toBe(23);
  })
  it('Rejects seemingly valid input but with extra data on the end', () => {
    expect(() => {decodeCBOR(new Uint8Array([0, 0]))}).toThrow(Error);
  })
  it('Rejects unknown input', () => {
    expect(() => {decodeCBOR(new Uint8Array([0xFF, 0xFF]))}).toThrow(Error);
  })
  it('Rejects unsupported single byte unsigned integers', () => {
    // Not enough length
    expect(() => {decodeCBOR(new Uint8Array([0x18]))}).toThrow(Error);
    // Not enough length
    expect(() => {decodeCBOR(new Uint8Array([0x19]))}).toThrow(Error);
    // Not supported
    expect(() => {decodeCBOR(new Uint8Array([0x1a]))}).toThrow(Error);
    // Not supported
    expect(() => {decodeCBOR(new Uint8Array([0x1b]))}).toThrow(Error);
    // Not supported
    expect(() => {decodeCBOR(new Uint8Array([0x1c]))}).toThrow(Error);
  })
  it('Can decode a double byte unsigned integer', () => {
    expect(decodeCBOR(new Uint8Array([0x18, 24]))).toBe(24);
    expect(decodeCBOR(new Uint8Array([0x18, 255]))).toBe(255);
  })
  it('Rejects unsupported double byte unsigned integers', () => {
    // Less than 24
    expect(() => {decodeCBOR(new Uint8Array([0x18, 0]))}).toThrow(Error);
    expect(() => {decodeCBOR(new Uint8Array([0x18, 23]))}).toThrow(Error);
  })
  expect('Rejects unsupported double byte unsigned integers', () => {
    // Not enough
    expect(decodeCBOR(new Uint8Array([0x19, 0]))).toThrow(Error);
  })
  it('Can decode a triple byte unsigned integer', () => {
    expect(decodeCBOR(new Uint8Array([0x19, 1, 0]))).toBe(256);
    expect(decodeCBOR(new Uint8Array([0x19, 1, 255]))).toBe(511);
    expect(decodeCBOR(new Uint8Array([0x19, 2, 0]))).toBe(512);
    expect(decodeCBOR(new Uint8Array([0x19, 255, 255]))).toBe(65535);
  })
  it('Can decode a single byte negative integer', () => {
    expect(decodeCBOR(new Uint8Array([0x20]))).toBe(-1);
    expect(decodeCBOR(new Uint8Array([0x21]))).toBe(-2);
    expect(decodeCBOR(new Uint8Array([0x37]))).toBe(-24);
  })
  it('Can decode a double byte negative integer', () => {
    expect(decodeCBOR(new Uint8Array([0x38, 0x18]))).toBe(-25);
    expect(decodeCBOR(new Uint8Array([0x38, 255]))).toBe(-256);
  })
  it('Can decode a triple byte unsigned integer', () => {
    expect(decodeCBOR(new Uint8Array([0x39, 1, 0]))).toBe(-257);
    expect(decodeCBOR(new Uint8Array([0x39, 1, 255]))).toBe(-512);
    expect(decodeCBOR(new Uint8Array([0x39, 2, 0]))).toBe(-513);
    expect(decodeCBOR(new Uint8Array([0x39, 255, 255]))).toBe(-65536);
  })
  it('Can decode empty strings', () => {
    expect(decodeCBOR(new Uint8Array([0x60]))).toBe('');
  })
  it('Can decode short strings', () => {
    expect(decodeCBOR(new Uint8Array([0x61,0x68]))).toBe('h');
    expect(decodeCBOR(new Uint8Array([0x6b,0x68,0x65,0x6c,0x6c,0x6f,0x20,0x77,0x6f,0x72,0x6c,0x64]))).toBe('hello world');
  })
  it('Can decode longer strings', () => {
    expect(decodeCBOR(new Uint8Array([0x78,0x1a,0x61,0x62,0x63,0x64,0x65,0x66,0x67,0x68,0x69,0x6a,0x6b,0x6c,0x6d,0x6e,0x6f,0x70,0x71,0x72,0x73,0x74,0x75,0x76,0x77,0x78,0x79,0x7a]))).toBe('abcdefghijklmnopqrstuvwxyz');
  })
  it('Can decode empty byte strings', () => {
    expect(decodeCBOR(new Uint8Array([0x40]))).toStrictEqual(new Uint8Array([]));
  })
  it('Can decode short byte strings', () => {
    // h
    expect(decodeCBOR(new Uint8Array([0x41, 0x68]))).toStrictEqual(new Uint8Array([0x68]));
    // hello world
    expect(decodeCBOR(new Uint8Array([0x4b,0x68,0x65,0x6c,0x6c,0x6f,0x20,0x77,0x6f,0x72,0x6c,0x64]))).toStrictEqual(new Uint8Array([0x68,0x65,0x6c,0x6c,0x6f,0x20,0x77,0x6f,0x72,0x6c,0x64]));
  })
  it('Can decode longer byte strings', () => {
    expect(decodeCBOR(new Uint8Array([0x58,0x1a,0x61,0x62,0x63,0x64,0x65,0x66,0x67,0x68,0x69,0x6a,0x6b,0x6c,0x6d,0x6e,0x6f,0x70,0x71,0x72,0x73,0x74,0x75,0x76,0x77,0x78,0x79,0x7a]))).toStrictEqual(new Uint8Array([0x61,0x62,0x63,0x64,0x65,0x66,0x67,0x68,0x69,0x6a,0x6b,0x6c,0x6d,0x6e,0x6f,0x70,0x71,0x72,0x73,0x74,0x75,0x76,0x77,0x78,0x79,0x7a]));
  })
  it('Rejects strings that are too short', () => {
    expect(() => {decodeCBOR(new Uint8Array([0x41]))}).toThrow(Error);
    expect(() => {decodeCBOR(new Uint8Array([0x58,0x1a,0x61]))}).toThrow(Error);
  })
  it('Can decode an empty array', () => {
    expect(decodeCBOR(new Uint8Array([0x80]))).toStrictEqual([]);
  })
  it('Can decode a short array', () => {
    expect(decodeCBOR(new Uint8Array([0x81, 1]))).toStrictEqual([1]);
    expect(decodeCBOR(new Uint8Array([0x82, 1, 2]))).toStrictEqual([1, 2]);
  })
  it('Can decode a longer array', () => {
    expect(decodeCBOR(new Uint8Array([0x98,0x18,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]))).toStrictEqual([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
  })
  it('Rejects arrays that are too short', () => {
    expect(() => {decodeCBOR(new Uint8Array([0x81]))}).toThrow(Error);
    expect(() => {decodeCBOR(new Uint8Array([0x98]))}).toThrow(Error);
    expect(() => {decodeCBOR(new Uint8Array([0x98, 0x18]))}).toThrow(Error);
    // Less than 24
    expect(() => {decodeCBOR(new Uint8Array([0x98, 1, 0]))}).toThrow(Error);
  })
  it('Can decode an empty map', () => {
    expect(decodeCBOR(new Uint8Array([0xa0]))).toStrictEqual({});
  })
  it('Can decode a small map', () => {
    expect(decodeCBOR(new Uint8Array([0xa1,0x61,0x31,1]))).toStrictEqual(new Map([["1", 1]]));
  })
  it('Rejects maps with missing key and values', () => {
    expect(() => {decodeCBOR(new Uint8Array([0xa1]))}).toThrow(Error);
    expect(() => {decodeCBOR(new Uint8Array([0xa1,0x61]))}).toThrow(Error);
    expect(() => {decodeCBOR(new Uint8Array([0xa1,0x61,0x31]))}).toThrow(Error);
  })
  it('Rejects maps with non string or int keys keys', () => {
    expect(() => {decodeCBOR(new Uint8Array([0xa1,0x61]))}).toThrow(Error);
    expect(() => {decodeCBOR(new Uint8Array([0xa1,0x80,1]))}).toThrow(Error);
  })
  it('Rejects maps with duplicate keys', () => {
    expect(() => {decodeCBOR(new Uint8Array([0xa1,0x61]))}).toThrow(Error);
    expect(() => {decodeCBOR(new Uint8Array([0xa2,0x61,0x31,1,0x61,0x31,1]))}).toThrow(Error);
  })
  it('Can decode webauthn registration', () => {
    // Apple MacBook
    expect(decodeCBOR(new Uint8Array([163,99,102,109,116,102,112,97,99,107,101,100,103,97,116,116,83,116,109,116,162,99,97,108,103,38,99,115,105,103,88,71,48,69,2,33,0,182,138,101,194,198,108,144,182,164,24,23,163,84,206,67,121,36,233,2,65,43,167,244,233,26,21,68,245,214,160,166,117,2,32,30,155,113,187,156,11,206,116,121,145,145,16,122,92,180,170,169,110,158,194,84,167,17,1,33,227,89,226,132,22,158,197,104,97,117,116,104,68,97,116,97,88,164,229,124,242,241,61,37,56,143,165,24,35,113,82,61,70,146,254,26,125,127,41,119,96,160,186,243,52,193,109,184,103,125,69,0,0,0,0,173,206,0,2,53,188,198,10,100,139,11,37,241,240,85,3,0,32,134,241,91,26,99,65,180,220,228,72,51,210,112,133,208,35,6,0,166,81,235,112,128,217,13,116,225,209,159,94,20,84,165,1,2,3,38,32,1,33,88,32,155,153,29,209,131,100,36,22,90,22,194,47,251,167,87,219,116,19,36,144,148,105,253,213,181,170,51,189,156,57,249,254,34,88,32,231,198,136,90,59,122,125,173,114,177,135,73,160,170,196,195,94,254,182,51,79,36,75,83,154,249,66,236,71,180,190,221]))).toStrictEqual(new Map([
      ['fmt', 'packed'],
      ['attStmt', new Map([
        ['alg', -7],
        ['sig', decodeBase64('MEUCIQC2imXCxmyQtqQYF6NUzkN5JOkCQSun9OkaFUT11qCmdQIgHptxu5wLznR5kZEQely0qqlunsJUpxEBIeNZ4oQWnsU=')]
      ])],
      ['authData', decodeBase64('5Xzy8T0lOI+lGCNxUj1Gkv4afX8pd2CguvM0wW24Z31FAAAAAK3OAAI1vMYKZIsLJfHwVQMAIIbxWxpjQbTc5Egz0nCF0CMGAKZR63CA2Q104dGfXhRUpQECAyYgASFYIJuZHdGDZCQWWhbCL/unV9t0EySQlGn91bWqM72cOfn+Ilgg58aIWjt6fa1ysYdJoKrEw17+tjNPJEtTmvlC7Ee0vt0=')]
    ]));
    // Yubikey 5
    const yubikeyPayload = decodeBase64('o2NmbXRmcGFja2VkZ2F0dFN0bXSjY2FsZyZjc2lnWEcwRQIhALBn778qDKHv8NV1uOmDJpK489XDUtETDzEmCx+/iNTpAiBIOHVRFmnNPCn2Mpa373DBhmOdCzJm4dRM00zKmykgsGN4NWOBWQLdMIIC2TCCAcGgAwIBAgIJAN+S2cTi7WYKMA0GCSqGSIb3DQEBCwUAMC4xLDAqBgNVBAMTI1l1YmljbyBVMkYgUm9vdCBDQSBTZXJpYWwgNDU3MjAwNjMxMCAXDTE0MDgwMTAwMDAwMFoYDzIwNTAwOTA0MDAwMDAwWjBvMQswCQYDVQQGEwJTRTESMBAGA1UECgwJWXViaWNvIEFCMSIwIAYDVQQLDBlBdXRoZW50aWNhdG9yIEF0dGVzdGF0aW9uMSgwJgYDVQQDDB9ZdWJpY28gVTJGIEVFIFNlcmlhbCAxMTU1MTA5NTk5MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEChhsbk0KalKKRJCaeiQjaHAo1MV+zLcXuhKAuFwvweTgYWaMPCCu8zNQ0ZZFI4osOQv13/o0/yVQL0cPPUC4iKOBgTB/MBMGCisGAQQBgsQKDQEEBQQDBQQDMCIGCSsGAQQBgsQKAgQVMS4zLjYuMS40LjEuNDE0ODIuMS43MBMGCysGAQQBguUcAgEBBAQDAgQwMCEGCysGAQQBguUcAQEEBBIEEC/AV5+BE0fqsRa7Wo25ICowDAYDVR0TAQH/BAIwADANBgkqhkiG9w0BAQsFAAOCAQEAgqyvETCpm9FDJ9L4+bBBoqBKZoUnJCLlexSwuPg7bxVFZku/VWgerwFYciq/ztLkrGM87AlZVkUksPLlF92XEJi5iRUX7NDFU6Lkc5+d4T2v0NXXuKxKN/TyzDDvJcsAZS0Z22nX2le9Gpwdjth9RtgNKzvf0dnvnStoMtStW810IUzmphQdFrLpOsssiPYKPrbV9hRxl1kJNzvGd5AjJFcaVz9g8Hu+0XuSyLWfooIQv6jGASKTABs57+V7+cseOsqKQTD4Ovhmj3Pe8nEbINyZ6KgE7qP3QnGXtrRRs3NcI7ybG+J0wm07+RlvjEpLcV9LlcTbe5fnWU60ZWSMHGhhdXRoRGF0YVjE5Xzy8T0lOI+lGCNxUj1Gkv4afX8pd2CguvM0wW24Z31BAAAAAi/AV5+BE0fqsRa7Wo25ICoAQPPTdIWWy5rxtPl7kMlvDhCnyedMAL1MnIb6Dr4X8LxYxxPPf1ePUCDkcaeTkDumNZe8QygXVYURVjC2C0Ms0I6lAQIDJiABIVgg7A8cNQWoU35zXxfQTE5VUTnG6ivmvGXP5guCyjRtX4MiWCCGwl6Xa+GjdAd9GIIIEAIfw0jDtNfET+V6HUUIU1LRYg==');
    expect(decodeCBOR(yubikeyPayload)).toStrictEqual(new Map([
      ['fmt', 'packed'],
      ['attStmt', new Map([
        ['alg', -7],
        ['sig', decodeBase64('MEUCIQCwZ++/Kgyh7/DVdbjpgyaSuPPVw1LREw8xJgsfv4jU6QIgSDh1URZpzTwp9jKWt+9wwYZjnQsyZuHUTNNMypspILA=')],
        ['x5c', [decodeBase64('MIIC2TCCAcGgAwIBAgIJAN+S2cTi7WYKMA0GCSqGSIb3DQEBCwUAMC4xLDAqBgNVBAMTI1l1YmljbyBVMkYgUm9vdCBDQSBTZXJpYWwgNDU3MjAwNjMxMCAXDTE0MDgwMTAwMDAwMFoYDzIwNTAwOTA0MDAwMDAwWjBvMQswCQYDVQQGEwJTRTESMBAGA1UECgwJWXViaWNvIEFCMSIwIAYDVQQLDBlBdXRoZW50aWNhdG9yIEF0dGVzdGF0aW9uMSgwJgYDVQQDDB9ZdWJpY28gVTJGIEVFIFNlcmlhbCAxMTU1MTA5NTk5MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEChhsbk0KalKKRJCaeiQjaHAo1MV+zLcXuhKAuFwvweTgYWaMPCCu8zNQ0ZZFI4osOQv13/o0/yVQL0cPPUC4iKOBgTB/MBMGCisGAQQBgsQKDQEEBQQDBQQDMCIGCSsGAQQBgsQKAgQVMS4zLjYuMS40LjEuNDE0ODIuMS43MBMGCysGAQQBguUcAgEBBAQDAgQwMCEGCysGAQQBguUcAQEEBBIEEC/AV5+BE0fqsRa7Wo25ICowDAYDVR0TAQH/BAIwADANBgkqhkiG9w0BAQsFAAOCAQEAgqyvETCpm9FDJ9L4+bBBoqBKZoUnJCLlexSwuPg7bxVFZku/VWgerwFYciq/ztLkrGM87AlZVkUksPLlF92XEJi5iRUX7NDFU6Lkc5+d4T2v0NXXuKxKN/TyzDDvJcsAZS0Z22nX2le9Gpwdjth9RtgNKzvf0dnvnStoMtStW810IUzmphQdFrLpOsssiPYKPrbV9hRxl1kJNzvGd5AjJFcaVz9g8Hu+0XuSyLWfooIQv6jGASKTABs57+V7+cseOsqKQTD4Ovhmj3Pe8nEbINyZ6KgE7qP3QnGXtrRRs3NcI7ybG+J0wm07+RlvjEpLcV9LlcTbe5fnWU60ZWSMHA==')]]
      ])],
      ['authData', decodeBase64('5Xzy8T0lOI+lGCNxUj1Gkv4afX8pd2CguvM0wW24Z31BAAAAAi/AV5+BE0fqsRa7Wo25ICoAQPPTdIWWy5rxtPl7kMlvDhCnyedMAL1MnIb6Dr4X8LxYxxPPf1ePUCDkcaeTkDumNZe8QygXVYURVjC2C0Ms0I6lAQIDJiABIVgg7A8cNQWoU35zXxfQTE5VUTnG6ivmvGXP5guCyjRtX4MiWCCGwl6Xa+GjdAd9GIIIEAIfw0jDtNfET+V6HUUIU1LRYg==')]
    ]));
  })
  it('Can decode webauthn registration attested credential public key', () => {
    const payload = decodeHex('a5010203262001215820ec0f1c3505a8537e735f17d04c4e555139c6ea2be6bc65cfe60b82ca346d5f8322582086c25e976be1a374077d18820810021fc348c3b4d7c44fe57a1d45085352d162');
    expect(decodeCBOR(payload)).toStrictEqual(new Map([
      [1, 2],
      [3, -7],
      [-1, 1],
      [-2, decodeHex('ec0f1c3505a8537e735f17d04c4e555139c6ea2be6bc65cfe60b82ca346d5f83')],
      [-3, decodeHex('86c25e976be1a374077d18820810021fc348c3b4d7c44fe57a1d45085352d162')]
    ]));
  });
  it('Decodes false', () => {
    expect(decodeCBOR(new Uint8Array([0b111_10100]))).toStrictEqual(false);
  })
  it('Decodes true', () => {
    expect(decodeCBOR(new Uint8Array([0b111_10101]))).toStrictEqual(true);
  })
  it('Decodes null', () => {
    expect(decodeCBOR(new Uint8Array([0b111_10110]))).toStrictEqual(null);
  })
  it('Decodes undefined', () => {
    expect(decodeCBOR(new Uint8Array([0b111_10111]))).toStrictEqual(undefined);
  })
})