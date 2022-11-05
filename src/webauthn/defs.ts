import { SupportedCOSEAlgorithm } from "../cose";
import { SupportedAlgorithm, SupportedPublicKey } from "../crypto";

export interface WebAuthnRegistrationAuthenticationDataAttestedCredentialData {
  aaguid: Uint8Array;
  credentialId: Uint8Array;
  credential: SupportedPublicKey;
}

export interface WebAuthnRegistrationAuthenticationData {
  rpIdHash: Uint8Array;
  flags: {
    userPresent: boolean;
    userVerified: boolean;
    backupEligibility: boolean;
    backupState: boolean;
    attestedCredentialDataIncluded: boolean;
    extensionDataIncluded: boolean;
  };
  signCounter: number;
  attestedCredentialData?: WebAuthnRegistrationAuthenticationDataAttestedCredentialData;
  extensions?: Map<number | string, any>;
}

export interface WebAuthnClientJson {
  type: 'webauthn.create' | 'webauthn.get';
  challenge: string;
  origin: string;
  crossOrigin: boolean;
}

export interface SignatureFormatNone {
  format: 'none';
}
export interface SignatureFormatPacked {
  format: 'packed';
  alg: SupportedAlgorithm;
  sig: Uint8Array;
  x5c?: Uint8Array[];
}
export type SignatureFormat = SignatureFormatNone | SignatureFormatPacked;

export interface WebAuthnRegister {
  authData: WebAuthnRegistrationAuthenticationData;
  publicKey: JsonWebKey;
  credentialId: Uint8Array;
  signature: SignatureFormat;
}

export interface PublicKeyCredentialParameters {
  type: 'public-key';
  alg: SupportedCOSEAlgorithm;
}
export type AuthenticatorTransport = 'usb' | 'nfc' | 'ble' | 'internal';
export interface PublicKeyCredentialDescriptor {
  type: 'public-key';
  id: Uint8Array;
  transports?: AuthenticatorTransport[];
}
export type UserVerificationRequirement =
  | 'required'
  | 'preferred'
  | 'discouraged';
export type ResidentKeyRequirement = 'required' | 'preferred' | 'discouraged';
export type TokenBindingStatus = 'present' | 'supported';
export type AuthenticatorAttachment = 'platform' | 'cross-platform';
export type AttestationConveyancePreference =
  | 'none'
  | 'indirect'
  | 'direct'
  | 'enterprise';
export interface PublicKeyCredentialRpEntity {
  id?: string;
  name: string;
}
export interface PublicKeyCredentialUserEntity {
  id: Uint8Array;
  name?: string;
  displayName: string;
}
export interface AuthenticatorSelectionCriteria {
  authenticatorAttachment?: AuthenticatorAttachment;
  residentKey?: ResidentKeyRequirement;
  requireResidentKey?: boolean;
  userVerification?: UserVerificationRequirement;
}

export interface WebAuthnRegisterArguments {
  rp: PublicKeyCredentialRpEntity;
  user: PublicKeyCredentialUserEntity;
  challenge: Uint8Array;
  pubKeyCredParams: PublicKeyCredentialParameters[];
  timeout?: number;
  excludeCredentials?: PublicKeyCredentialDescriptor[];
  authenticatorSelection?: AuthenticatorSelectionCriteria;
  attestation?: AttestationConveyancePreference;
  extensions?: object;
}