import {decode} from './cbor'

import { describe, it, expect } from 'vitest'

describe('CBOR Decoding', () => {
  it('Can decode a single byte unsigned integer', () => {
    expect(decode(new Uint8Array([0]))).toBe(0);
    expect(decode(new Uint8Array([1]))).toBe(1);
    expect(decode(new Uint8Array([23]))).toBe(23);
  })
  it('Can decode a double byte unsigned integer', () => {
    expect(decode(new Uint8Array([0x18, 24]))).toBe(24);
    expect(decode(new Uint8Array([0x18, 255]))).toBe(255);
  })
  it('Can decode a triple byte unsigned integer', () => {
    expect(decode(new Uint8Array([0x19, 1, 0]))).toBe(256);
    expect(decode(new Uint8Array([0x19, 1, 255]))).toBe(511);
    expect(decode(new Uint8Array([0x19, 2, 0]))).toBe(512);
    expect(decode(new Uint8Array([0x19, 255, 255]))).toBe(65535);
  })
  it('Can decode a single byte negative integer', () => {
    expect(decode(new Uint8Array([0x20]))).toBe(-1);
    expect(decode(new Uint8Array([0x21]))).toBe(-2);
    expect(decode(new Uint8Array([0x37]))).toBe(-24);
  })
  it('Can decode a double byte negative integer', () => {
    expect(decode(new Uint8Array([0x38, 0x18]))).toBe(-25);
    expect(decode(new Uint8Array([0x38, 255]))).toBe(-256);
  })
  it('Can decode a triple byte unsigned integer', () => {
    expect(decode(new Uint8Array([0x39, 1, 0]))).toBe(-257);
    expect(decode(new Uint8Array([0x39, 1, 255]))).toBe(-512);
    expect(decode(new Uint8Array([0x39, 2, 0]))).toBe(-513);
    expect(decode(new Uint8Array([0x39, 255, 255]))).toBe(-65536);
  })
})