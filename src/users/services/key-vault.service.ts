import { KeyVaultSecret } from '@azure/keyvault-secrets';

export function getCertFromSecret(keyVaultSecret: KeyVaultSecret): string {
  let caarr = keyVaultSecret.value.split(' ');
  caarr[0] = caarr[0] + ' ' + caarr[1];
  caarr[caarr.length - 2] =
    caarr[caarr.length - 2] + ' ' + caarr[caarr.length - 1];
  caarr = caarr.filter((_, idx) => idx !== 1);
  caarr = caarr.filter((_, idx) => idx !== caarr.length - 1);
  return caarr.join('\n');
}

export function getPrivateKeyFromSecret(
  keyVaultSecret: KeyVaultSecret,
): string {
  let keyarr = keyVaultSecret.value.split(' ');
  keyarr[0] = keyarr[0] + ' ' + keyarr[1];
  keyarr = keyarr.filter((_, idx) => idx !== 1);
  keyarr[0] = keyarr[0] + ' ' + keyarr[1];
  keyarr = keyarr.filter((_, idx) => idx !== 1);
  keyarr[0] = keyarr[0] + ' ' + keyarr[1];
  keyarr = keyarr.filter((_, idx) => idx !== 1);

  keyarr[keyarr.length - 2] =
    keyarr[keyarr.length - 2] + ' ' + keyarr[keyarr.length - 1];
  keyarr = keyarr.filter((_, idx) => idx !== keyarr.length - 1);
  keyarr[keyarr.length - 2] =
    keyarr[keyarr.length - 2] + ' ' + keyarr[keyarr.length - 1];
  keyarr = keyarr.filter((_, idx) => idx !== keyarr.length - 1);
  keyarr[keyarr.length - 2] =
    keyarr[keyarr.length - 2] + ' ' + keyarr[keyarr.length - 1];
  keyarr = keyarr.filter((_, idx) => idx !== keyarr.length - 1);

  return keyarr.join('\n');
}
