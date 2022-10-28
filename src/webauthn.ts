import {decodePartialCBOR} from './cbor';
import {decodePublicKey, PublicKeyES256, PublicKeyRS256} from './cose';

export interface WebAuthnRegistrationAuthenticationDataAttestedCredentialData {
  aaguid: Uint8Array;
  credentialId: Uint8Array;
  credential: PublicKeyES256 | PublicKeyRS256;
}

export interface WebAuthnRegistrationAuthenticationData {
  rpIdHash: Uint8Array;
  flags: {
    userPresent: boolean;
    userVerified: boolean;
    attestedCredentialDataIncluded: boolean;
    extensionDataIncluded: boolean;
  };
  signCounter: number;
  attestedCredentialData?: WebAuthnRegistrationAuthenticationDataAttestedCredentialData;
  extensions?: Map<number | string, any>;
}

function decodeWebAuthnAttestedCredential(
  data: Uint8Array,
  offset: number
): [WebAuthnRegistrationAuthenticationDataAttestedCredentialData, number] {
  const aaguid = data.slice(offset, offset + 16);
  const credentialIdLength = (data[offset + 16] << 8) | data[offset + 17];
  const credentialId = data.slice(
    offset + 18,
    offset + 18 + credentialIdLength
  );
  const [decoded, length] = decodePartialCBOR(
    data,
    offset + 18 + credentialIdLength
  );
  if (!(decoded instanceof Map)) {
    throw new Error('Attested Credential is not well formed');
  }
  const credential = decodePublicKey(decoded);
  const credentialData: WebAuthnRegistrationAuthenticationDataAttestedCredentialData =
    {
      aaguid,
      credentialId,
      credential,
    };
  const credentialDataLength = 18 + credentialIdLength + length;
  return [credentialData, credentialDataLength];
}

export function decodeWebAuthnRegistration(
  data: Uint8Array
): WebAuthnRegistrationAuthenticationData {
  const rpIdHash = data.slice(0, 32);
  const flags = data[32];
  const userPresent = (flags & 1) !== 0;
  const userVerified = (flags & 2) !== 0;
  const attestedCredentialDataIncluded = (flags & 64) !== 0;
  const extensionDataIncluded = (flags & 128) !== 0;
  const signCounter =
    (data[33] << 24) | (data[34] << 16) | (data[35] << 8) | data[36];
  const value: WebAuthnRegistrationAuthenticationData = {
    rpIdHash,
    flags: {
      userPresent,
      userVerified,
      attestedCredentialDataIncluded,
      extensionDataIncluded,
    },
    signCounter,
  };

  let totalLength = 37;
  if (attestedCredentialDataIncluded) {
    const [attestedCredentialData, length] = decodeWebAuthnAttestedCredential(
      data,
      totalLength
    );
    value.attestedCredentialData = attestedCredentialData;
    totalLength += length;
  }

  if (extensionDataIncluded) {
    const [extensions, length] = decodePartialCBOR(data, totalLength);
    if (extensions instanceof Map) {
      value.extensions = extensions;
    } else {
      throw new Error('Extensions is not well formed');
    }
    totalLength += length;
  }

  if (totalLength < data.length) {
    throw new Error(
      `Registration is not well formed ${totalLength} < ${data.length}`
    );
  }

  return value;
}
