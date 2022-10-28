import { describe, it, expect } from 'vitest'
import {decodeHex, decodeBase64, decodeBase64Url, encodeBase64, encodeBase64Url, encodeHex} from './util'

const textEncoder = new TextEncoder();
describe('Hex Encoding Decoding', () => {
  it('Hex decoding works', () => {
    expect(decodeHex("00")).toStrictEqual(new Uint8Array([0x00]));
    expect(decodeHex("00FF00FF")).toStrictEqual(new Uint8Array([0,255,0,255]));
  })
  it('Hex encoding works', () => {
    expect(encodeHex(new Uint8Array([0x00]))).toStrictEqual("00");
    expect(encodeHex(new Uint8Array([0,255,0,255]))).toStrictEqual("00ff00ff");
  })
  it('Hex throws', () => {
    expect(() => {
      decodeHex(null);
    }).toThrow(Error);
    expect(() => {
      decodeHex({});
    }).toThrow(Error);
    expect(() => {
      decodeHex("taco");
    }).toThrow(Error);
  })
});
describe('Base64 Encoding Decoding', () => {
  it('Base64 decoding works', () => {
    expect(decodeBase64("aGVsbG8gd29ybGQ=")).toStrictEqual(textEncoder.encode('hello world'));
    expect(decodeBase64("ABEiM0RVZneImaq7zN3u/w==")).toStrictEqual(new Uint8Array([
      0x00,0x11,0x22,0x33,0x44,0x55,0x66,0x77,0x88,0x99,
      0xAA,0xBB,0xCC,0xDD,0xEE,0xFF
    ]));
    expect(decodeBase64("AAD+")).toStrictEqual(new Uint8Array([0,0,254]));
    expect(decodeBase64("AAD/")).toStrictEqual(new Uint8Array([0,0,255]));
  })
  it('Base64 encoding works', () => {
    expect(encodeBase64(textEncoder.encode('hello world'))).toStrictEqual("aGVsbG8gd29ybGQ=");
    expect(encodeBase64(new Uint8Array([0,0,254]))).toStrictEqual("AAD+");
    expect(encodeBase64(new Uint8Array([0,0,255]))).toStrictEqual("AAD/");
  })
});
describe('Base64 URL Encoding Decoding', () => {
  it('Base64 url decoding works', () => {
    expect(decodeBase64Url("aGVsbG8gd29ybGQ")).toStrictEqual(textEncoder.encode('hello world'));
    expect(decodeBase64Url("ABEiM0RVZneImaq7zN3u_w")).toStrictEqual(new Uint8Array([
      0x00,0x11,0x22,0x33,0x44,0x55,0x66,0x77,0x88,0x99,
      0xAA,0xBB,0xCC,0xDD,0xEE,0xFF
    ]));
    expect(decodeBase64Url("AAD-")).toStrictEqual(new Uint8Array([0,0,254]));
    expect(decodeBase64Url("AAD_")).toStrictEqual(new Uint8Array([0,0,255]));
  })
  it('Base64 url encoding works', () => {
    expect(encodeBase64Url(textEncoder.encode('hello world'))).toStrictEqual("aGVsbG8gd29ybGQ");
    expect(encodeBase64Url(new Uint8Array([0,0,254]))).toStrictEqual("AAD-");
    expect(encodeBase64Url(new Uint8Array([0,0,255]))).toStrictEqual("AAD_");
  })
});