import { KeyVaultSecret } from '@azure/keyvault-secrets';

export function getCertFromSecret(keyVaultSecret: KeyVaultSecret): Buffer {
  let certArr = keyVaultSecret.value.split(' ');
  if (certArr[0].startsWith('-----BEGIN')) {
    while (certArr[1] && certArr[0].lastIndexOf('CERTIFICATE-----') === -1) {
      certArr[0] = certArr[0] + ' ' + certArr[1];
      certArr = certArr.filter((_, idx) => idx !== 1);
    }

    while (certArr[certArr.length - 1].lastIndexOf('-----END') === -1) {
      certArr[certArr.length - 2] =
        certArr[certArr.length - 2] + ' ' + certArr[certArr.length - 1];
      certArr = certArr.filter((_, idx) => idx !== certArr.length - 1);
    }
  }

  return toBuffer(new TextEncoder().encode(certArr.join('\n')));
}

export function getPrivateKeyFromSecret(
  keyVaultSecret: KeyVaultSecret,
): Buffer {
  let keyarr = keyVaultSecret.value.split(' ');
  if (keyarr[0].startsWith('-----BEGIN')) {
    while (keyarr[1] && keyarr[0].lastIndexOf('KEY-----') === -1) {
      keyarr[0] = keyarr[0] + ' ' + keyarr[1];
      keyarr = keyarr.filter((_, idx) => idx !== 1);
    }

    while (keyarr[keyarr.length - 1].lastIndexOf('-----END') === -1) {
      keyarr[keyarr.length - 2] =
        keyarr[keyarr.length - 2] + ' ' + keyarr[keyarr.length - 1];
      keyarr = keyarr.filter((_, idx) => idx !== keyarr.length - 1);
    }
  }

  return toBuffer(new TextEncoder().encode(keyarr.join('\n')));
}

function toBuffer(arrayBuffer: Uint8Array): Buffer {
  const buf = Buffer.alloc(arrayBuffer.byteLength);
  for (let i = 0; i < buf.length; ++i) {
    buf[i] = arrayBuffer[i];
  }
  return buf;
}
