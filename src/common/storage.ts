import { NFTStorage, Blob } from 'nft.storage';
import { packToBlob } from 'ipfs-car/pack/blob';

export async function storeBuidlerMetaData(jsonData) {
  const nftStorage = new NFTStorage({ token: process.env.NFT_STORAGE_TOKEN });
  const content = new Blob([JSON.stringify(jsonData)], {
    type: 'application/json',
  });

  const { root, car } = await packToBlob({
    input: content,
    rawLeaves: false,
    wrapWithDirectory: false,
  });

  await nftStorage.storeCar(car);
  const cidV0 = root.toV0();

  return 'ipfs://' + cidV0.toString();
}
