import { Injectable } from '@nestjs/common';
import { NFTStorage, Blob } from 'nft.storage';

@Injectable()
export class UploadService {
  async uploadToNFTStorage(imageDataUrl) {
    const nftStorage = new NFTStorage({
      token: process.env.NFT_STORAGE_TOKEN,
    });
    // todo support more
    const imageData = imageDataUrl
      .replace(/^data:image\/png;base64,/, '')
      .replace(/^data:image\/jpeg;base64,/, '');
    const imageBuffer = Buffer.from(imageData, 'base64');
    const someData = new Blob([imageBuffer]);
    const cid = await nftStorage.storeBlob(someData);

    return cid;
  }
}
