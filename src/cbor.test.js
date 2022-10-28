import { describe, it, expect } from 'vitest'
import {decodeCBOR, decodeLength, decodePartialCBOR} from './cbor'
import {decodeHex} from './util'

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
    expect(decodeCBOR(new Uint8Array([0xa1,0x61,0x31,1]))).toStrictEqual({"1": 1});
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
    expect(decodeCBOR(new Uint8Array([163,99,102,109,116,102,112,97,99,107,101,100,103,97,116,116,83,116,109,116,162,99,97,108,103,38,99,115,105,103,88,71,48,69,2,33,0,182,138,101,194,198,108,144,182,164,24,23,163,84,206,67,121,36,233,2,65,43,167,244,233,26,21,68,245,214,160,166,117,2,32,30,155,113,187,156,11,206,116,121,145,145,16,122,92,180,170,169,110,158,194,84,167,17,1,33,227,89,226,132,22,158,197,104,97,117,116,104,68,97,116,97,88,164,229,124,242,241,61,37,56,143,165,24,35,113,82,61,70,146,254,26,125,127,41,119,96,160,186,243,52,193,109,184,103,125,69,0,0,0,0,173,206,0,2,53,188,198,10,100,139,11,37,241,240,85,3,0,32,134,241,91,26,99,65,180,220,228,72,51,210,112,133,208,35,6,0,166,81,235,112,128,217,13,116,225,209,159,94,20,84,165,1,2,3,38,32,1,33,88,32,155,153,29,209,131,100,36,22,90,22,194,47,251,167,87,219,116,19,36,144,148,105,253,213,181,170,51,189,156,57,249,254,34,88,32,231,198,136,90,59,122,125,173,114,177,135,73,160,170,196,195,94,254,182,51,79,36,75,83,154,249,66,236,71,180,190,221]))).toStrictEqual({
      fmt: "packed",
      attStmt: {
        alg: -7,
        sig: new Uint8Array([48,69,2,33,0,182,138,101,194,198,108,144,182,164,24,23,163,84,206,67,121,36,233,2,65,43,167,244,233,26,21,68,245,214,160,166,117,2,32,30,155,113,187,156,11,206,116,121,145,145,16,122,92,180,170,169,110,158,194,84,167,17,1,33,227,89,226,132,22,158,197])
      },
      authData: new Uint8Array([229,124,242,241,61,37,56,143,165,24,35,113,82,61,70,146,254,26,125,127,41,119,96,160,186,243,52,193,109,184,103,125,69,0,0,0,0,173,206,0,2,53,188,198,10,100,139,11,37,241,240,85,3,0,32,134,241,91,26,99,65,180,220,228,72,51,210,112,133,208,35,6,0,166,81,235,112,128,217,13,116,225,209,159,94,20,84,165,1,2,3,38,32,1,33,88,32,155,153,29,209,131,100,36,22,90,22,194,47,251,167,87,219,116,19,36,144,148,105,253,213,181,170,51,189,156,57,249,254,34,88,32,231,198,136,90,59,122,125,173,114,177,135,73,160,170,196,195,94,254,182,51,79,36,75,83,154,249,66,236,71,180,190,221])
    });
    // Yubikey 5
    const yubikeyPayload = decodeHex('a363666d74667061636b65646761747453746d74a363616c67266373696758473045022100b067efbf2a0ca1eff0d575b8e9832692b8f3d5c352d1130f31260b1fbf88d4e90220483875511669cd3c29f63296b7ef70c186639d0b3266e1d44cd34cca9b2920b063783563815902dd308202d9308201c1a003020102020900df92d9c4e2ed660a300d06092a864886f70d01010b0500302e312c302a0603550403132359756269636f2055324620526f6f742043412053657269616c203435373230303633313020170d3134303830313030303030305a180f32303530303930343030303030305a306f310b300906035504061302534531123010060355040a0c0959756269636f20414231223020060355040b0c1941757468656e74696361746f72204174746573746174696f6e3128302606035504030c1f59756269636f205532462045452053657269616c20313135353130393539393059301306072a8648ce3d020106082a8648ce3d030107034200040a186c6e4d0a6a528a44909a7a2423687028d4c57eccb717ba1280b85c2fc1e4e061668c3c20aef33350d19645238a2c390bf5dffa34ff25502f470f3d40b888a38181307f3013060a2b0601040182c40a0d0104050403050403302206092b0601040182c40a020415312e332e362e312e342e312e34313438322e312e373013060b2b0601040182e51c0201010404030204303021060b2b0601040182e51c010104041204102fc0579f811347eab116bb5a8db9202a300c0603551d130101ff04023000300d06092a864886f70d01010b0500038201010082acaf1130a99bd14327d2f8f9b041a2a04a6685272422e57b14b0b8f83b6f1545664bbf55681eaf0158722abfced2e4ac633cec0959564524b0f2e517dd971098b9891517ecd0c553a2e4739f9de13dafd0d5d7b8ac4a37f4f2cc30ef25cb00652d19db69d7da57bd1a9c1d8ed87d46d80d2b3bdfd1d9ef9d2b6832d4ad5bcd74214ce6a6141d16b2e93acb2c88f60a3eb6d5f61471975909373bc677902324571a573f60f07bbed17b92c8b59fa28210bfa8c6012293001b39efe57bf9cb1e3aca8a4130f83af8668f73def2711b20dc99e8a804eea3f7427197b6b451b3735c23bc9b1be274c26d3bf9196f8c4a4b715f4b95c4db7b97e7594eb465648c1c68617574684461746158c4e57cf2f13d25388fa5182371523d4692fe1a7d7f297760a0baf334c16db8677d41000000022fc0579f811347eab116bb5a8db9202a0040f3d3748596cb9af1b4f97b90c96f0e10a7c9e74c00bd4c9c86fa0ebe17f0bc58c713cf7f578f5020e471a793903ba63597bc4328175585115630b60b432cd08ea5010203262001215820ec0f1c3505a8537e735f17d04c4e555139c6ea2be6bc65cfe60b82ca346d5f8322582086c25e976be1a374077d18820810021fc348c3b4d7c44fe57a1d45085352d162');
    expect(decodeCBOR(yubikeyPayload)).toStrictEqual({
      fmt: "packed",
      attStmt: {
        alg: -7,
        sig: decodeHex('3045022100b067efbf2a0ca1eff0d575b8e9832692b8f3d5c352d1130f31260b1fbf88d4e90220483875511669cd3c29f63296b7ef70c186639d0b3266e1d44cd34cca9b2920b0'),
        x5c: [decodeHex('308202d9308201c1a003020102020900df92d9c4e2ed660a300d06092a864886f70d01010b0500302e312c302a0603550403132359756269636f2055324620526f6f742043412053657269616c203435373230303633313020170d3134303830313030303030305a180f32303530303930343030303030305a306f310b300906035504061302534531123010060355040a0c0959756269636f20414231223020060355040b0c1941757468656e74696361746f72204174746573746174696f6e3128302606035504030c1f59756269636f205532462045452053657269616c20313135353130393539393059301306072a8648ce3d020106082a8648ce3d030107034200040a186c6e4d0a6a528a44909a7a2423687028d4c57eccb717ba1280b85c2fc1e4e061668c3c20aef33350d19645238a2c390bf5dffa34ff25502f470f3d40b888a38181307f3013060a2b0601040182c40a0d0104050403050403302206092b0601040182c40a020415312e332e362e312e342e312e34313438322e312e373013060b2b0601040182e51c0201010404030204303021060b2b0601040182e51c010104041204102fc0579f811347eab116bb5a8db9202a300c0603551d130101ff04023000300d06092a864886f70d01010b0500038201010082acaf1130a99bd14327d2f8f9b041a2a04a6685272422e57b14b0b8f83b6f1545664bbf55681eaf0158722abfced2e4ac633cec0959564524b0f2e517dd971098b9891517ecd0c553a2e4739f9de13dafd0d5d7b8ac4a37f4f2cc30ef25cb00652d19db69d7da57bd1a9c1d8ed87d46d80d2b3bdfd1d9ef9d2b6832d4ad5bcd74214ce6a6141d16b2e93acb2c88f60a3eb6d5f61471975909373bc677902324571a573f60f07bbed17b92c8b59fa28210bfa8c6012293001b39efe57bf9cb1e3aca8a4130f83af8668f73def2711b20dc99e8a804eea3f7427197b6b451b3735c23bc9b1be274c26d3bf9196f8c4a4b715f4b95c4db7b97e7594eb465648c1c')]
      },
      authData: decodeHex('e57cf2f13d25388fa5182371523d4692fe1a7d7f297760a0baf334c16db8677d41000000022fc0579f811347eab116bb5a8db9202a0040f3d3748596cb9af1b4f97b90c96f0e10a7c9e74c00bd4c9c86fa0ebe17f0bc58c713cf7f578f5020e471a793903ba63597bc4328175585115630b60b432cd08ea5010203262001215820ec0f1c3505a8537e735f17d04c4e555139c6ea2be6bc65cfe60b82ca346d5f8322582086c25e976be1a374077d18820810021fc348c3b4d7c44fe57a1d45085352d162')
    });
  })
})