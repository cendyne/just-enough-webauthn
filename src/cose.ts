export interface PublicKeyES256 {
  kty: 2 // label: 1 - COSE Key Types - EC2
  alg: -7 // label: 3 - COSE Algorithms - ES256
  crv: 1 // label: -1 - COSE Elliptic Curves - P-256
  x: Uint8Array // label: -2 - COSE Key Type Parameters - x
  y: Uint8Array // label: -3 - COSE Key Type Parameters - y
}
export interface PublicKeyRS256 {
  kty: 3 // label: 1 - COSE Key Types - RSA
  alg: -257 // label: 3 - COSE Algorithms - RS256
  n: Uint8Array // label: -1 - COSE Key Type Parameters - n
  e: Uint8Array // label: -2 - COSE Key Type Parameters - x
}
