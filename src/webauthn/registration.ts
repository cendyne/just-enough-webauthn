import {decodeCBOR, decodePartialCBOR} from '../cbor';
import {decodePublicKey, isCoseAlgorithmSupported} from '../cose';
import { encodeJWK } from '../jose';
import { SignatureFormat, WebAuthnClientJson, WebAuthnRegister, WebAuthnRegisterArguments, WebAuthnRegistrationAuthenticationData, WebAuthnRegistrationAuthenticationDataAttestedCredentialData } from './defs';

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

export function decodeWebAuthnAuthData(
  data: Uint8Array
): WebAuthnRegistrationAuthenticationData {
  const rpIdHash = data.slice(0, 32);
  const flags = data[32];
  const userPresent = (flags & 1) !== 0;
  const userVerified = (flags & 4) !== 0;
  const backupEligibility = (flags & 8) !== 0;
  const backupState = (flags & 16) !== 0;
  const attestedCredentialDataIncluded = (flags & 64) !== 0;
  const extensionDataIncluded = (flags & 128) !== 0;
  const signCounter =
    (data[33] << 24) | (data[34] << 16) | (data[35] << 8) | data[36];
  if (!backupEligibility && backupState) {
    throw new Error('Backup flags are not acceptable');
  }
  const value: WebAuthnRegistrationAuthenticationData = {
    rpIdHash,
    flags: {
      userPresent,
      userVerified,
      backupEligibility,
      backupState,
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

export function decodeWebAuthnRegister(
  attestationObject: Uint8Array
): WebAuthnRegister {
  const decoder = new TextDecoder();
  let cbor = decodeCBOR(attestationObject);
  if (!(cbor instanceof Map)) {
    throw new Error('Attestation object not well formed');
  }
  let format = cbor.get('fmt');
  let signature: SignatureFormat = {
    format: 'none'
  };
  if (format === 'none') {
    throw new Error('Not supported yet')
  } else if (format === 'packed') {
    let attStmt = cbor.get('attStmt');
    if (!(attStmt instanceof Map)) {
      throw new Error('packed attestation statement not well formed');
    }
    let alg = attStmt.get('alg');
    let sig = attStmt.get('sig');
    let x5c = attStmt.get('x5c');
    if (!isCoseAlgorithmSupported(alg)) {
      throw new Error('alg not supported');
    }
    if (!(sig instanceof Uint8Array)) {
      throw new Error('sig not well formed or missing');
    }
    if (x5c) {
      if (x5c instanceof Array) {
        for (let x509 of x5c) {
          if (!(x509 instanceof Uint8Array)) {
            throw new Error('x5c not well formed');
          }
        }
      } else {
        throw new Error('x5c not well formed');
      }
    }
    signature = {
      format: 'packed',
      alg,
      sig,
      x5c
    }
  } else {
    throw new Error('Format not supported');
  }
  let authDataBytes = cbor.get('authData');
  if (!(authDataBytes instanceof Uint8Array)) {
    throw new Error('authData not well formed');
  }
  let authData = decodeWebAuthnAuthData(authDataBytes);
  if (!authData.attestedCredentialData) {
    throw new Error('Auth data lacks attested credential');
  }
  let publicKey = encodeJWK(authData.attestedCredentialData.credential);
  let credentialId = authData.attestedCredentialData.credentialId;

  return {
    authData,
    credentialId,
    publicKey,
    signature
  }
}
