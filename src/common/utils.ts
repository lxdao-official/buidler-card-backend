import { BusinessException } from './business.exception';

export function removeEmpty<T>(obj: T): T {
  Object.keys(obj).forEach(function (key) {
    if (typeof obj[key] === 'undefined') {
      delete obj[key];
    }
  });
  return obj;
}

export function getNonce(): string {
  return parseInt((Math.random() * 1000000).toString(), 10).toString();
}

export function validateAddress(address): boolean {
  // todo simple validation for address + add to nest guard
  if (false) {
    throw new BusinessException({
      message: 'Invalid wallet address format, please check your wallet.',
      error_code: 'INVALID_WALLET_ADDRESS',
    });
  }
  return true;
}

export function capitalize(string): string {
  const words = string.split(' ');
  let i;
  for (i = 0; i < words.length; i++) {
    words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
  }
  return words.join(' ');
}

export function convertIpfsGateway(ipfsUrl) {
  // https://cloudflare-ipfs.com/ipfs/bafkreid67qrfaq2yqacnsvpvfnetjocgy7kiuwu4jw4v23tc3yqgfgis2e
  // to
  // https://bafkreid67qrfaq2yqacnsvpvfnetjocgy7kiuwu4jw4v23tc3yqgfgis2e.ipfs.nftstorage.link/
  if (ipfsUrl && ipfsUrl.includes('cloudflare-ipfs')) {
    const cid = ipfsUrl.replace('https://cloudflare-ipfs.com/ipfs/', '');
    return `https://${cid}.ipfs.nftstorage.link`;
  }
  return ipfsUrl;
}
