import {PublicKeyES256, PublicKeyRS256} from './cose';

export interface WebAuthnRegistrationAuthenticationDataAttestedCredentialData {
  aaguid: Uint8Array;
  credentialIdLength: number;
  credentialId: Uint8Array;
  credential: PublicKeyES256 | PublicKeyRS256;
}

export interface WebAuthnRegistrationAuthenticationData {
  rpIdHash: Uint8Array;
  flags: {
    userPresent: boolean;
    userverified: boolean;
    attestedCredentialDataIncluded: boolean;
    extensionDataIncluded: boolean;
  };
  signCounter: number;
  attestedCredentialData?: WebAuthnRegistrationAuthenticationDataAttestedCredentialData;
}
